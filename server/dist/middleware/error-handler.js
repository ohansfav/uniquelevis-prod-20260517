export const errorHandler = (err, _req, res, _next) => {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    res.status(500).json({ message });
};
