package main

import (
	"bytes"
	"encoding/json"
	"image"
	"io"
	"net/http"
	"os"
	// "path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/m1kx/image/internal/gif"
	"github.com/m1kx/image/util"
)

func main() {
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")
		c.Next()
	})

	// จัดการ static files สำหรับ frontend
	r.Static("/assets", "./frontend/build/assets")
	r.StaticFile("/", "./frontend/build/index.html")

	r.NoRoute(func(c *gin.Context) { // สำหรับ React router
		c.File("./frontend/build/index.html")
	})

	r.POST("/api/video", func(c *gin.Context) {
		var points []util.Vec2
		pointsStr, exists := c.GetPostForm("points")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{
				"status": "error",
				"error":  "Please provide points",
			})
			return
		}

		err := json.Unmarshal([]byte(pointsStr), &points)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}

		formFile, err := c.FormFile("image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}

		file, err := formFile.Open()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}
		defer file.Close()

		data, err := io.ReadAll(file)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}

		imageInput, _, err := image.Decode(bytes.NewReader(data))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}

		outputPath, err := gif.CreateVideo(&imageInput, &points) // ← ใช้ฟังก์ชันใหม่
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status": "error",
				"error":  err.Error(),
			})
			return
		}

		// Set headers for MP4 response
		c.Header("Content-Type", "video/mp4")
		c.Header("Content-Disposition", "inline; filename=output.mp4")

		// Open and stream video back
		c.File(outputPath)

		// Optional: clean up the file afterward
		defer os.Remove(outputPath)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "9999"
	}
	r.Run(":" + port)
}
