import { Canvas } from "@/components/canvas";
import LoadingSpinner from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Dropzone from "@/components/dropzone";

type Vec2 = {
  x: number;
  y: number;
};

const file_upload = (e: ChangeEvent<HTMLInputElement>) => {
  const img_size: Vec2 = {
    x: 0,
    y: 0,
  };
  const form_data: FormData = new FormData();
  const reader: FileReader = new FileReader();

  const input: HTMLInputElement = e.target;
  console.log(input.files);
  if (!input.files) {
    return {
      form_data,
      img_size,
      reader,
    };
  }
  const file: File = input.files[0];
  if (!file) {
    return {
      form_data,
      img_size,
      reader,
    };
  }

  reader.readAsDataURL(file);
  form_data.append("image", file);

  return {
    form_data,
    img_size,
    reader,
  };
};

export default function App() {
  const [event, setEvent] = useState<ChangeEvent<HTMLInputElement>>();
  const [previewImageSrc, setPreviewImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [imageSize, setImageSize] = useState<Vec2>({ x: 0, y: 0 });
  const [originalImageSize, setOriginalImageSize] = useState<Vec2>({
    x: 0,
    y: 0,
  });
  const [selectedArr, setSelectedArr] = useState<Vec2[]>([
    { x: -1, y: -1 },
    { x: -1, y: -1 },
    { x: -1, y: -1 },
  ]);
  const [formData, setFormData] = useState<FormData>();
  const [resultUrl, setResultUrl] = useState<string>("");
  const [loadingResultUrl, setLoadingResultUrl] = useState<boolean | null>(
    null
  );

  const image_ref = useRef<HTMLImageElement>(null);

  const update_canvas_size = () => {
    setImageSize({
      x: image_ref.current ? image_ref.current.width : 0,
      y: image_ref.current ? image_ref.current.height : 0,
    });
  };

  useEffect(() => {
    window.addEventListener("resize", update_canvas_size);
    return () => window.removeEventListener("resize", update_canvas_size);
  }, []);

  useEffect(() => {
    if (!event) return;
    setLoading(true);
    const { form_data, reader } = file_upload(event);

    setFormData(form_data);

    reader.onload = () => {
      setLoading(false);
      if (!image_ref || !image_ref.current) return;
      image_ref.current.onload = () => {
        setOriginalImageSize({
          x: image_ref.current ? image_ref.current.naturalWidth : 0,
          y: image_ref.current ? image_ref.current.naturalHeight : 0,
        });
        setImageSize({
          x: image_ref.current ? image_ref.current.width : 0,
          y: image_ref.current ? image_ref.current.height : 0,
        });
      };
      if (previewImageSrc != "") {
        setSelectedArr([
          { x: -1, y: -1 },
          { x: -1, y: -1 },
          { x: -1, y: -1 },
        ]);
      }
      setPreviewImageSrc(reader.result as string);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const run = async () => {
    setLoadingResultUrl(true);
    const img_points = selectedArr.map((point, index) => {
      const zone = index;
      return {
        x: Math.round(
          (point.x / (imageSize.x * 4)) * originalImageSize.x -
            (originalImageSize.x / 3) * zone
        ),
        y: Math.round((point.y / (imageSize.y * 4)) * originalImageSize.y),
      };
    });
    const send_data = {
      points: img_points,
    };
    for (const item in send_data) {
      formData?.append(
        item,
        JSON.stringify(send_data[item as keyof typeof send_data])
      );
    }
    try {
      const res = await fetch("http://localhost/api/video", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("");
      }
      const data = await res.blob();
      console.log(data);
      const url = URL.createObjectURL(data);
      console.log({ url });
      setResultUrl(url);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingResultUrl(false);
    }
  };

  const downloadVideo = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `video-${Date.now()}.mp4`;
    a.click();
  };

  if (loadingResultUrl != null && loadingResultUrl) {
    return (
      <div
        className="flex h-dvh w-dvw flex-col items-center justify-center"
        style={{ backgroundColor: "#E1DFE2", color: "#2E2A4B" }}
      >
        <p className="p-5 text-center text-xl font-semibold">
          กำลังสร้างวิดีโอ...
        </p>
        <LoadingSpinner />
      </div>
    );
  }

  if (resultUrl != "") {
    return (
      <div
        className="flex w-dvw flex-col items-center justify-center gap-6 py-12"
        style={{ backgroundColor: "#E1DFE2", color: "#2E2A4B" }}
      >
        <video
          id="videoPreview"
          width={360}
          controls
          src={resultUrl}
          className="rounded-lg shadow-lg"
        ></video>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-[140px] rounded-full font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: "#9A8B9C",
              color: "#FFFFFF",
              border: "none",
            }}
          >
            เริ่มใหม่
          </Button>
          <Button
            onClick={() => downloadVideo(resultUrl)}
            className="w-[140px] rounded-full font-medium transition-all hover:scale-105"
            style={{ backgroundColor: "#9A8B9C", color: "#FFFFFF" }}
          >
            ดาวน์โหลด
          </Button>
        </div>
      </div>
    );
  }

  if (!loading && previewImageSrc == "") {
    return (
      <div
        className="w-screen min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#E1DFE2", color: "#2E2A4B" }}
      >
        <Dropzone onFileChange={setEvent} />
      </div>
    );
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-start"
      style={{ backgroundColor: "#E1DFE2", color: "#2E2A4B" }}
    >
      {loading && (
        <div className="flex h-dvh w-dvw flex-col items-center justify-center">
          <p className="p-5 text-xl font-medium">กำลังโหลดภาพ</p>
          <LoadingSpinner />
        </div>
      )}
      <div className="relative flex flex-col items-center justify-center pl-5 pr-5 py-8">
        <div className="max-w-3xl space-y-6">
          <p className="text-center text-3xl font-bold">
            เลือกจุดในตำแหน่งเดียวกันของทั้ง 3 ภาพ
          </p>
          <Canvas
            size={imageSize}
            image={previewImageSrc}
            selectedArr={selectedArr}
            setSelectedArr={setSelectedArr}
          />
          <img
            hidden={!previewImageSrc}
            ref={image_ref}
            src={previewImageSrc}
            alt=""
          />
          <div
            hidden={!previewImageSrc}
            className="w-full pt-4 text-center text-sm text-gray-700"
          >
            <br /> <b>บนคอม</b> - ใช้ปุ่มลูกศรเพื่อเลื่อน และกด Enter
            เพื่อกำหนดจุด
            <br /> <b>บนมือถือ</b> - เลื่อนภาพตัวอย่างด้านบน และกด SET POINT
            เพื่อกำหนดจุด
          </div>

          <div className="w-full max-w-3xl pl-5 pr-5 pt-4">
            <Button
              className="w-full rounded-full py-6 font-medium text-lg transition-all hover:scale-105"
              onClick={() => run()}
              disabled={selectedArr.filter((elem) => elem.x != -1).length != 3}
              style={{ backgroundColor: "#9A8B9C", color: "#FFFFFF" }}
            >
              สร้างวิดีโอ
            </Button>
          </div>
        </div>
      </div>

      {/* <AlertDialog open={error}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              There was an error during the creation of the gif. Please try
              again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              onClick={() => {
                window.location.reload();
              }}
            >
              Restart
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </main>
  );
}
