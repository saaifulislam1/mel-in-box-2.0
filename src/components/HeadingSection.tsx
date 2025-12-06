import { SquareArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

interface propsType {
  title?: string;
  href: string;
  textColor: string;
  icon?: React.ElementType;
  isTitle?: boolean;
}
const HeadingSection = (props: propsType) => {
  const { title, href, textColor, icon: Icon, isTitle = true } = props;
  console.log(title, href, "from comp");
  return (
    <div className="flex flex-wrap items-center justify-start md:justify-center  gap-3">
      <Link
        href="/"
        className={`inline-flex items-center align-middle  px-2 py-3 rounded-full ${textColor}   mr-17 md:mr-0`}
      >
        <SquareArrowLeft className="w-[40px] h-[40px]" />
      </Link>
      {isTitle && Icon && (
        <div
          className={`inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white/90 shadow-sm ${textColor} font-semibold text-base sm:text-lg`}
        >
          <Icon className="w-5 h-5 shrink-0" />
          <span className="font-semibold whitespace-nowrap">{title}</span>
        </div>
      )}
    </div>
  );
};

export default HeadingSection;
