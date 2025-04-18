import { Canvas } from "@/components/canvas";
import LoadingSpinner from "@/components/loading-spinner";
// import {
//   AlertDialog,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
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
    // ERR
    return {
      form_data,
      img_size,
      reader,
    };
  }
  const file: File = input.files[0];
  if (!file) {
    // ERR
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
  // const [error, setError] = useState<boolean>(false);

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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      formData?.append(item, JSON.stringify(send_data[item]));
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
      // setLoadingResultUrl(false);
      // setError(true);
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
      <div className="flex h-dvh w-dvw flex-col items-center justify-center">
        <p className="p-5 text-center">Generating video...</p>
        <LoadingSpinner />
      </div>
    );
  }

  if (resultUrl != "") {
    return (
      <div className="flex w-dvw flex-col items-center justify-center gap-4 py-8">
        <video id="videoPreview" width={360} controls src={resultUrl}></video>

        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-[120px]"
          >
            RESTART
          </Button>
          <Button
            onClick={() => downloadVideo(resultUrl)}
            className="w-[120px]"
          >
            DOWNLOAD
          </Button>
        </div>
      </div>
    );
  }

  if (!loading && previewImageSrc == "") {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Dropzone onFileChange={setEvent} />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start">
      {loading && (
        <div className="flex h-dvh w-dvw flex-col items-center justify-center">
          <p className="p-5">Loading Image</p>
          <LoadingSpinner />
        </div>
      )}
      <div className="relative flex flex-col items-center justify-center pl-5 pr-5 py-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-center text-2xl">
            Select 3 Points to Create a Video
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
            className="w-full pt-4 text-center text-xs text-gray-600	"
          >
            Tip:
            <br /> <b>on pc</b> - use arrow keys and enter to move around and
            set points.
            <br /> <b>on mobile</b> - swipe in the preview image above to set
            points
          </div>

          <div className="w-full max-w-3xl pl-5 pr-5 pt-2">
            <Button
              className="w-full"
              onClick={() => run()}
              disabled={selectedArr.filter((elem) => elem.x != -1).length != 3}
            >
              Generate Video
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
