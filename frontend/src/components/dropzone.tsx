import { ChangeEvent, SVGProps } from "react";

type Props = {
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function Dropzone({ onFileChange }: Props) {
  return (
    <div className="w-full h-full p-28">
      <div className="relative group border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-700 w-full h-full">
        <input
          type="file"
          className="sr-only"
          id="file"
          onChange={onFileChange}
        />
        <label
          htmlFor="file"
          className="cursor-pointer absolute inset-0 z-10 flex items-center justify-center w-full p-4 gap-2"
        >
          <UploadIcon className="w-8 h-8" />
          <span className="text-sm font-medium">Upload Image</span>
        </label>
      </div>
      {/* <div className="mt-2 flex items-center gap-2">
        <Button size="sm">Remove</Button>
      </div> */}
    </div>
  );
}

function UploadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
