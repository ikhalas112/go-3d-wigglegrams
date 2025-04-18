package images

import (
	"fmt"
	"image"
	"math"
	"time"

	"github.com/disintegration/imaging"
	"github.com/m1kx/image/util"
)

func GetOffsettedFrames(images []image.Image, offsets map[int]util.Vec2, maxOffset util.Vec2) []image.Image {
	frameStart := time.Now()
	framesImg := make([]image.Image, len(images)+len(images)-2)
	for i, img := range images {
		offset := offsets[i]
		result := imaging.Paste(img, img, image.Pt(offset.X, offset.Y))
		subImg := result.SubImage(result.Bounds())
		result = imaging.CropCenter(subImg, result.Bounds().Dx()-int(math.Abs(float64(maxOffset.X)))*2, result.Bounds().Dy()-int(math.Abs(float64(maxOffset.Y)))*2)
		subImgBack := result.SubImage(result.Bounds())
		framesImg[i] = subImgBack
		if i != len(images)-1 && i != 0 {
			framesImg[len(framesImg)-i] = subImgBack
		}
	}
	durationFrames := time.Since(frameStart)
	framesTime := float64(durationFrames.Milliseconds())
	fmt.Printf("Took %dms to create image frames\n", int(framesTime))
	return framesImg
}
