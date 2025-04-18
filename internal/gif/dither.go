package gif

import (
	"fmt"
	"image"
	"image/gif"
	"time"

	"github.com/GaryBrownEEngr/easygif"
)

func Dither(framesImg []image.Image) *gif.GIF {
	ditherStart := time.Now()
	dithered := easygif.Dithered(framesImg, time.Millisecond*150)
	durationDither := time.Since(ditherStart)
	ditherTime := float64(durationDither.Milliseconds())
	fmt.Printf("Took %dms to dither images\n", int(ditherTime))
	return dithered
}
