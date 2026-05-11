import { Router } from "express";
import { z } from "zod";
import { createMessage, findUserById, getMessagesByMatch, isUserInMatch, markMessagesRead, matches, } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";
export const messagesRouter = Router();
const subscribers = [];
const emitToUser = (userId, event, payload) => {
    const body = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    subscribers
        .filter((s) => s.userId === userId)
        .forEach((s) => s.res.write(body));
};
messagesRouter.get("/messages/stream", requireAuth, (req, res) => {
    const userId = req.authUserId;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    const subscriber = { userId, res };
    subscribers.push(subscriber);
    res.write(`event: ready\ndata: ${JSON.stringify({ ok: true, userId })}\n\n`);
    req.on("close", () => {
        const index = subscribers.indexOf(subscriber);
        if (index >= 0) {
            subscribers.splice(index, 1);
        }
    });
});
messagesRouter.get("/messages/:matchId", requireAuth, (req, res) => {
    const userId = req.authUserId;
    const { matchId } = req.params;
    if (!isUserInMatch(matchId, userId)) {
        res.status(403).json({ message: "You are not part of this match" });
        return;
    }
    res.json({ messages: getMessagesByMatch(matchId) });
});
messagesRouter.post("/messages/:matchId/read", requireAuth, (req, res) => {
    const userId = req.authUserId;
    const { matchId } = req.params;
    if (!isUserInMatch(matchId, userId)) {
        res.status(403).json({ message: "You are not part of this match" });
        return;
    }
    markMessagesRead(matchId, userId);
    res.json({ ok: true });
});
const sendMessageSchema = z.object({
    text: z.string().min(1).max(1000),
});
messagesRouter.post("/messages/:matchId", requireAuth, (req, res) => {
    const userId = req.authUserId;
    const { matchId } = req.params;
    if (!isUserInMatch(matchId, userId)) {
        res.status(403).json({ message: "You are not part of this match" });
        return;
    }
    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
        return;
    }
    const message = createMessage(matchId, userId, parsed.data.text.trim());
    const match = matches.find((m) => m.id === matchId);
    const userA = findUserById(match.userA);
    const userB = findUserById(match.userB);
    emitToUser(match.userA, "message", {
        matchId,
        message,
        from: userA?.id === userId ? userA?.firstName : userB?.firstName,
    });
    emitToUser(match.userB, "message", {
        matchId,
        message,
        from: userA?.id === userId ? userA?.firstName : userB?.firstName,
    });
    res.status(201).json({ message });
});
const typingSchema = z.object({
    isTyping: z.boolean(),
});
messagesRouter.post("/messages/:matchId/typing", requireAuth, (req, res) => {
    const userId = req.authUserId;
    const { matchId } = req.params;
    if (!isUserInMatch(matchId, userId)) {
        res.status(403).json({ message: "You are not part of this match" });
        return;
    }
    const parsed = typingSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
        return;
    }
    const match = matches.find((m) => m.id === matchId);
    const otherUserId = match.userA === userId ? match.userB : match.userA;
    const sender = findUserById(userId);
    emitToUser(otherUserId, "typing", {
        matchId,
        byUserId: userId,
        byName: sender?.firstName ?? "Someone",
        isTyping: parsed.data.isTyping,
    });
    res.json({ ok: true });
});
