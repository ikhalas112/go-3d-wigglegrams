package gif

import (
	"bytes"
	"fmt"
	"image"
	"image/gif"
	"time"

	"os"
	"image/png"
	"os/exec"

	"github.com/m1kx/image/internal/images"
	"github.com/m1kx/image/util"
)

func CreateGif(imageInput *image.Image, points *[]util.Vec2) ([]byte, error) {

	start := time.Now()
	splittedImages := images.SplitImage(imageInput)
	durationSplit := time.Since(start)
	splitTime := float64(durationSplit.Milliseconds())
	fmt.Printf("Took %dms to split images\n", int(splitTime))
	offsets, maxOffset := util.GetOffsets(points)
	fmt.Printf("Offsets: %v\n", offsets)
	fmt.Printf("Max offset: %v\n", maxOffset)
	framesImg := images.GetOffsettedFrames(splittedImages, offsets, maxOffset)
	dithered := Dither(framesImg)
	buf, err := BufferDithered(dithered)
	if err != nil {
		return []byte{}, err
	}
	duration := time.Since(start)
	totalTime := float64(duration.Milliseconds())
	fmt.Printf("Ran %dms\n", int(totalTime))
	return buf.Bytes(), nil
}

func BufferDithered(dithered *gif.GIF) (bytes.Buffer, error) {
	var buf bytes.Buffer
	encodeStart := time.Now()
	err := gif.EncodeAll(&buf, dithered)
	if err != nil {
		return buf, err
	}
	durationEncode := time.Since(encodeStart)
	encodeTime := float64(durationEncode.Milliseconds())
	fmt.Printf("Took %dms to encode images\n", int(encodeTime))
	return buf, nil
}

func CreateVideo(imageInput *image.Image, points *[]util.Vec2) (string, error) {
	start := time.Now()
	fmt.Println("เริ่มการสร้างวิดีโอ...")
	
	fmt.Println("กำลังแยกภาพ...")
	splittedImages := images.SplitImage(imageInput)
	fmt.Printf("แยกภาพเสร็จสิ้น ได้ %d เฟรม\n", len(splittedImages))
	
	fmt.Println("กำลังคำนวณ offsets...")
	offsets, maxOffset := util.GetOffsets(points)
	fmt.Printf("คำนวณ offsets เสร็จสิ้น (max offset: %v)\n", maxOffset)
	
	fmt.Println("กำลังสร้างเฟรมที่มีการ offset...")
	framesImg := images.GetOffsettedFrames(splittedImages, offsets, maxOffset)
	fmt.Printf("สร้างเฟรมเสร็จสิ้น ได้ %d เฟรม\n", len(framesImg))

	fmt.Println("กำลังสร้างโฟลเดอร์ชั่วคราว...")
	timestamp := time.Now().UnixMilli()
	frameDir := fmt.Sprintf("temp/frames_%d", timestamp)
	if err := os.MkdirAll("temp", os.ModePerm); err != nil {
		return "", fmt.Errorf("failed to create temp directory: %w", err)
	}
	if err := os.MkdirAll(frameDir, os.ModePerm); err != nil {
		return "", fmt.Errorf("failed to create frames directory: %w", err)
	}
	fmt.Printf("สร้างโฟลเดอร์ %s เสร็จสิ้น\n", frameDir)

	fmt.Println("กำลังบันทึกเฟรมพื้นฐานเป็นไฟล์ PNG...")
	// บันทึกเฉพาะเฟรมที่ไม่ซ้ำกัน
	frameFiles := make(map[int]string)
	for i, img := range framesImg {
		framePath := fmt.Sprintf("%s/base_frame_%d.png", frameDir, i)
		f, err := os.Create(framePath)
		if err != nil {
			return "", fmt.Errorf("failed to create frame: %w", err)
		}
		err = png.Encode(f, img)
		f.Close()
		if err != nil {
			return "", fmt.Errorf("failed to encode frame: %w", err)
		}
		frameFiles[i] = framePath
		fmt.Printf("บันทึกเฟรมพื้นฐานที่ %d\n", i)
	}

	fmt.Println("กำลังสร้าง symbolic links สำหรับ loop animation...")
	pattern := []int{1, 2, 1, 0} // index 0-based
	totalFrames := len(pattern) * 8 // ทำซ้ำ pattern 5 รอบ
	
	for i := 0; i < totalFrames; i++ {
		frameIndex := pattern[i%len(pattern)]
		sourceFile := frameFiles[frameIndex]
		targetPath := fmt.Sprintf("%s/frame_%03d.png", frameDir, i)
		
		// สร้าง hard link แทนการคัดลอกไฟล์
		err := os.Link(sourceFile, targetPath)
		if err != nil {
			return "", fmt.Errorf("failed to create frame link: %w", err)
		}
		fmt.Printf("สร้าง link สำหรับเฟรม %d/%d\n", i+1, totalFrames)
	}
	fmt.Println("สร้าง links ทั้งหมดเสร็จสิ้น")

	outputPath := fmt.Sprintf("temp/output_%d.mp4", timestamp)
	fmt.Println("กำลังสร้างวิดีโอด้วย ffmpeg...")

	cmd := exec.Command("ffmpeg",
		"-y", // overwrite output
		"-framerate", "6",
		"-i", fmt.Sprintf("%s/frame_%%03d.png", frameDir),
		"-vf", "scale=iw:trunc(ih/2)*2", 
		"-c:v", "libx264",
		"-preset", "ultrafast",        
		"-crf", "28",                   
		"-pix_fmt", "yuv420p",
		outputPath,
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("ffmpeg failed: %w", err)
	}
	fmt.Println("สร้างวิดีโอเสร็จสิ้น")

	fmt.Println("กำลังทำความสะอาดไฟล์ชั่วคราว...")
	// ลบไฟล์เฟรมพื้นฐาน
	for _, path := range frameFiles {
		os.Remove(path)
	}
	// ลบ links ทั้งหมด
	for i := 0; i < totalFrames; i++ {
		os.Remove(fmt.Sprintf("%s/frame_%03d.png", frameDir, i))
	}
	os.RemoveAll(frameDir)
	fmt.Println("ทำความสะอาดเสร็จสิ้น")

	duration := time.Since(start)
	fmt.Printf("สร้างวิดีโอเสร็จสมบูรณ์ ใช้เวลาทั้งหมด %dms\n", duration.Milliseconds())

	return outputPath, nil
}
