export default function handler(req, res) {
  res.status(200).json({
    status: "Operational",
    ops_count: 142,
    message: "Node is active"
  });
}
