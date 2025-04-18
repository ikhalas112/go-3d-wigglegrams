package util

import (
	"math"
)

// CalculateOffset คำนวณระยะห่างระหว่างจุด 2 จุด
// รับพารามิเตอร์:
//   - points: พอยน์เตอร์ไปยังสไลซ์ของจุด Vec2 2 จุด
// คืนค่า:
//   - Vec2: เวกเตอร์ที่แสดงระยะห่างระหว่างจุด
func CalculateOffset(points *[]Vec2) Vec2 {
	return Vec2{
		X: (*points)[1].X - (*points)[0].X, // คำนวณระยะห่างแกน X
		Y: (*points)[1].Y - (*points)[0].Y, // คำนวณระยะห่างแกน Y
	}
}

// GetOffsets คำนวณระยะห่างระหว่างจุดทั้ง 3 จุด และหาระยะห่างสูงสุด
// รับพารามิเตอร์:
//   - points: พอยน์เตอร์ไปยังสไลซ์ของจุด Vec2 3 จุด
// คืนค่า:
//   - map[int]Vec2: แมปของระยะห่างระหว่างจุดแต่ละคู่
//   - Vec2: ระยะห่างสูงสุดในแต่ละแกน
func GetOffsets(points *[]Vec2) (map[int]Vec2, Vec2) {
	// แยกจุดเป็น 2 คู่
	c1_c2_points := (*points)[0:2]    // จุดที่ 1 กับ 2
	c2_c3_points := (*points)[1:3]    // จุดที่ 2 กับ 3
	
	offsets := map[int]Vec2{}
	offsets[1] = Vec2{}               // จุดกลางไม่มีการเลื่อน
	
	// คำนวณระยะห่างระหว่างจุด 1-2
	offset_c1_c2 := CalculateOffset(&c1_c2_points)
	offsets[0] = offset_c1_c2
	
	// สลับลำดับจุด 2-3 เพื่อคำนวณระยะห่าง
	for i, j := 0, len(c2_c3_points)-1; i < j; i, j = i+1, j-1 {
		c2_c3_points[i], c2_c3_points[j] = c2_c3_points[j], c2_c3_points[i]
	}
	offset_c2_c3 := CalculateOffset(&c2_c3_points)
	offsets[2] = offset_c2_c3
	
	// หาระยะห่างสูงสุดในแต่ละแกน
	maxOffset := Vec2{}
	for _, offset := range offsets {
		if math.Abs(float64(offset.X)) > math.Abs(float64(maxOffset.X)) {
			maxOffset.X = offset.X
		}
		if math.Abs(float64(offset.Y)) > math.Abs(float64(maxOffset.Y)) {
			maxOffset.Y = offset.Y
		}
	}
	return offsets, maxOffset
}
