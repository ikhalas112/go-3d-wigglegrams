import { ChangeEvent } from "react";
import logo from "@/assets/logo.png";
import example from "@/assets/example.jpg";
import vdo_example from "@/assets/vdo_example.mp4";
import instagram from "@/assets/instagram.png";
import shopee from "@/assets/shopee.png";

type Props = {
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function Dropzone({ onFileChange }: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center flex-col py-12">
      <div className="flex items-center justify-center flex-col gap-2">
        <img src={logo} alt="logo" className="w-[150px]" />
        <div className="flex items-center justify-center flex-col">
          <p className="text-center text-3xl font-bold">SiamDispo</p>
          <p className="text-center text-lg">Wiggle Maker</p>
        </div>
      </div>

      <div className="relative group  w-[200px] h-[44px] border-gray-300 rounded-full dark:border-gray-700 bg-[#9A8B9C] my-8">
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
          <span className="text-sm font-medium text-white">Upload Image</span>
        </label>
      </div>

      <div>
        <p className="text-center text-base mt-4 mb-6 font-noto">
          สร้างวิดีโอที่ดุ๊กดิ๊กได้ง่ายๆ เพียงอัพโหลดภาพจากเลนส์ <br />
          SiamDispo จากนั้นเลือกจุดอ้างอิง และกดสร้างวิดีโอได้เลย
        </p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <p className="text-center text-base mb-2 font-noto">ภาพตัวอย่าง</p>
        <img src={example} alt="example" className="w-[600px]" />
        <div className="flex justify-center items-center my-4">
          <svg
            width="54"
            height="54"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L12 20M12 20L18 14M12 20L6 14"
              stroke="#2E2A4B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <video src={vdo_example} className="w-[200px]" autoPlay muted loop />
      </div>

      <div className="flex gap-4 items-center justify-center mt-8">
        <a href="https://www.instagram.com/siamdispo/" target="_blank">
          <img src={instagram} alt="instagram" className="w-[38px]" />
        </a>
        <a href="https://shopee.co.th/siamdispo" target="_blank">
          <img src={shopee} alt="shoppee" className="w-[38px]" />
        </a>
      </div>
    </div>
  );
}
