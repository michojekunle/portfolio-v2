/** Domain errors for the French feature — route handlers map these to HTTP statuses. */

export class FrenchDomainError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class SessionNotEligibleError extends FrenchDomainError {}

export class PersistenceError extends FrenchDomainError {
  constructor(operation: string, cause: unknown) {
    super(`Database operation failed: ${operation}`, { cause });
  }
}

export class AiUnavailableError extends FrenchDomainError {}

/** A group action the learner can fix (full group, bad code, already in one). The message is safe to show. */
export class GroupError extends FrenchDomainError {}

/** A reminder couldn't be delivered (no address, provider rejected it). */
export class ReminderDeliveryError extends FrenchDomainError {}
