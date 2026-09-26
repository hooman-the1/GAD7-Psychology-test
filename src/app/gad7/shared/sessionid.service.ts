import { Injectable } from "@angular/core";

/** Compatibility seam for the extracted feature; server/session removal is a later issue. */
@Injectable({ providedIn: 'root' })
export class SessionID {
    generateSessionId(): string {
        return crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now();
    }

    ensureSessionId(key: string): string {
        let sessionId = localStorage.getItem(key);
        if (!sessionId) {
            sessionId = this.generateSessionId();
            localStorage.setItem(key, sessionId);
        }
        return sessionId;
    }
}
