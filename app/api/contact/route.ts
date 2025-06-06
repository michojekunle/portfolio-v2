const { createClient } = require("@supabase/supabase-js");
const sgMail = require("@sendgrid/mail");
const validator = require("validator");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(request: Request) {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  const { name, email, subject, message } = await request.json();
  // Handle preflight request
  if (request.method === "OPTIONS") {
    return Response.json(
      {
        statusCode: 204,
        headers,
        body: "",
      },
      { status: 204, headers }
    );
  }

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return Response.json(
      {
        statusCode: 400,
        headers,
        body: "Missing required fields: name, email, and message are required",
      },
      { status: 400, headers }
    );
  }

  // Validate field lengths
  if (name.length < 2 || name.length > 100) {
    return Response.json(
      {
        statusCode: 400,
        headers,
        body: "Name must be between 2 and 100 characters",
      },
      { status: 400, headers }
    );
  }
  if (subject.length < 2 || subject.length > 100) {
    return Response.json(
      {
        statusCode: 400,
        headers,
        body: "Subject must be between 2 and 200 characters",
      },
      { status: 400, headers }
    );
  }
  if (message.length < 10 || message.length > 1000) {
    return Response.json(
      {
        statusCode: 400,
        headers,
        body: "Message must be between 10 and 1000 characters",
      },
      { status: 400, headers }
    );
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return Response.json(
      {
        statusCode: 400,
        headers,
        body: "Invalid email format",
      },
      { status: 400, headers }
    );
  }

  // Sanitize inputs
  const sanitizedName = name.trim();
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedSubject = subject.trim();
  const sanitizedMessage = message.trim();

  // Additional security: Block obvious SQL injection attempts
  const injectionPattern =
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\s+\w+\b)|(--)|(\b(ALTER|CREATE|DROP)\s+TABLE\b)/i;
  if (
    injectionPattern.test(sanitizedName) ||
    injectionPattern.test(sanitizedSubject) ||
    injectionPattern.test(sanitizedMessage)
  ) {
    console.warn("Suspicious SQL injection pattern detected in input");
    return Response.json(
      {
        statusCode: 400,
        headers,
        body: "Invalid input: suspicious patterns detected",
      },
      { status: 400, headers }
    );
  }

  // Store in Supabase
  const { data, error } = await supabase.from("messages").insert([
    {
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
    },
  ]);

  if (error) {
    console.error("Supabase error:", error);
    return Response.json(
      {
        statusCode: 500,
        headers,
        body: "Failed to store message",
      },
      { status: 500, headers }
    );
  }

  // Email to business
  const businessEmail = {
    to: "michojekunle1@gmail.com", // Replace with your business email
    from: "amdgtb001@gmail.com", // Replace with your verified sender
    subject: "New Contact Form Submission",
    text: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\nSubject: ${sanitizedSubject}\nMessage: ${sanitizedMessage}`,
    html: `<p><strong>Name:</strong> ${sanitizedName}</p><p><strong>Email:</strong> ${sanitizedEmail}</p><p><strong>Subject:</strong> ${sanitizedSubject}</p><p><strong>Message:</strong> ${sanitizedMessage}</p>`,
  };

  // Feedback email to user
  const userEmail = {
    to: sanitizedEmail,
    from: "michojekunle1@gmail.com", // Replace with your verified sender
    subject: "Thank You for Contacting Me",
    text: "Thank you for your message! I have received it and will respond soon.",
    html: "<p>Thank you for your message! I have received it and will respond soon.</p>",
  };

  // Send emails
  try {
    await sgMail.send(businessEmail);
    await sgMail.send(userEmail);
  } catch (emailError) {
    console.error("Email sending error:", emailError);
    return Response.json(
      {
        statusCode: 500,
        headers,
        body: "Failed to send email",
      },
      { status: 500, headers }
    );
  }

  return Response.json(
    {
      statusCode: 200,
      headers,
      body: "Message sent and stored successfully",
    },
    { status: 200, headers }
  );
}
