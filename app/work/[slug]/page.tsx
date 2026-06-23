import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { getCaseStudy, CASE_STUDIES } from "@/lib/case-studies"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return CASE_STUDIES.map((cs) => ({ slug: cs.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cs = getCaseStudy(slug)
  if (!cs) return { title: "Project not found" }
  return {
    title: `${cs.name} Case Study`,
    description: cs.desc,
  }
}

export default async function CaseStudyPage({ params }: Props): Promise<React.ReactElement> {
  const { slug } = await params
  const p = getCaseStudy(slug)
  if (!p) notFound()

  const nextSlug = p.next
  const nextProject = nextSlug ? getCaseStudy(nextSlug) : null

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section className="v3-case-hero v3-container">
          <div className="v3-eyebrow" style={{ marginBottom: 24 }}>
            <Link href="/work" style={{ color: "inherit" }}>← Work</Link> · Project {p.idx}
          </div>
          <div className="meta">
            <div><div className="k">Role</div><div className="v">{p.role}</div></div>
            <div><div className="k">Duration</div><div className="v">{p.duration}</div></div>
            <div><div className="k">Team</div><div className="v">{p.team}</div></div>
          </div>
          <h1>
            {p.name.split(" ").map((w, j, arr) =>
              j === arr.length - 1
                ? <em key={j}>{w}.</em>
                : <span key={j}>{w} </span>
            )}
          </h1>
          <p className="lede">{p.lede}</p>
        </section>

        {/* Image */}
        {p.image && (
          <section className="v3-container" style={{ marginBottom: 80 }}>
            <div className="v3-case-image">
              <Image src={p.image} alt={p.name} fill className="object-cover object-top" sizes="(max-width: 1320px) 100vw, 1320px" />
            </div>
          </section>
        )}
        {!p.image && (
          <section className="v3-container" style={{ marginBottom: 80 }}>
            <div className="v3-case-image">
              <div className="placeholder" aria-hidden="true" />
            </div>
          </section>
        )}

        {/* Body */}
        <section className="v3-section v3-container">
          <div className="v3-case-body">
            {/* Sticky sidebar */}
            <aside className="side">
              <h5>Stack</h5>
              <ul>
                {p.stack.map((s) => <li key={s}>{s}</li>)}
              </ul>
              {p.live && (
                <>
                  <h5>Live</h5>
                  <ul>
                    <li>
                      <a href={`https://${p.live.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--v3-accent)" }}>
                        {p.live.replace(/^https?:\/\//, "")} ↗
                      </a>
                    </li>
                  </ul>
                </>
              )}
              <h5>Year</h5>
              <ul><li>{p.year}</li></ul>
            </aside>

            {/* Main content */}
            <div className="main">
              <h2>The <em>problem.</em></h2>
              <p>{p.problem}</p>

              <h2>The <em>approach.</em></h2>
              <p>{p.approach}</p>

              <h2>The <em>process.</em></h2>
              {p.process.map((step, i) => (
                <p key={i}>
                  <b>{String(i + 1).padStart(2, "0")} ·</b> {step}
                </p>
              ))}

              <h2>The <em>outcome.</em></h2>
              <div className="v3-num-grid">
                {p.outcomes.map((o, i) => (
                  <div key={i} className="v3-num-card">
                    <div className="n">{o.n}</div>
                    <div className="l">{o.l}</div>
                    <div className="d">{o.d}</div>
                  </div>
                ))}
              </div>

              <h2>What I <em>learned.</em></h2>
              <p className="v3-pull">{p.learned}</p>
            </div>
          </div>
        </section>

        {/* Next project nav */}
        <section className="v3-container">
          <div className="v3-case-next">
            <Link href="/work">
              <div className="lbl">← All work</div>
              <div className="nm">Index</div>
            </Link>
            {nextProject && (
              <Link href={`/work/${nextProject.slug}`}>
                <div className="lbl">Next project →</div>
                <div className="nm">{nextProject.name}</div>
              </Link>
            )}
          </div>
        </section>
      </main>
  )
}
