export default function handler(req, res) {
  // Retorna apenas configurações seguras para o front-end
  res.status(200).json({
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL || process.env.META_PIXEL_ID || ''
  });
}
