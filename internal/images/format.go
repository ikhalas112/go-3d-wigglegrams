package images

import (
	"image"
	"image/draw"
)

// SplitImage แบ่งรูปภาพเป็น 3 ส่วนเท่าๆ กันในแนวนอน
// รับพารามิเตอร์:
//   - img: พอยน์เตอร์ไปยังรูปภาพต้นฉบับ
// คืนค่า:
//   - []image.Image: สไลซ์ของรูปภาพที่ถูกแบ่ง 3 ส่วน
func SplitImage(img *image.Image) []image.Image {
	// สร้างสไลซ์เก็บรูปที่แบ่งทั้ง 3 ส่วน
	sImgs := make([]image.Image, 3)
	
	// ดึงขนาดของรูปต้นฉบับ
	bounds := (*img).Bounds()
	
	// วนลูปสร้างรูปย่อยทั้ง 3 ส่วน
	for i := range len(sImgs) {
		// สร้างรูปใหม่ขนาด 1/3 ของความกว้างเดิม
		sImg := image.NewRGBA(image.Rect(0, 0, bounds.Dx()/3, bounds.Dy()))
		
		// คัดลอกพิกเซลจากรูปต้นฉบับไปยังรูปใหม่
		// โดยเลื่อนตำแหน่งเริ่มต้นตามลำดับ i
		draw.Draw(sImg, bounds, (*img), image.Point{(bounds.Dx() / 3) * i, 0}, draw.Src)
		
		// เก็บรูปที่แบ่งลงในสไลซ์
		sImgs[i] = sImg
	}
	
	return sImgs
}
