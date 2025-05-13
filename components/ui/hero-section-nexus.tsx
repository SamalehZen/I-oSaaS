"use client"

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
  type SVGProps,
} from "react"
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  type Transition,
  type VariantLabels,
  type Target,
  type AnimationControls,
  type TargetAndTransition,
  type Variants,
} from "framer-motion"
import { useTheme } from "next-themes"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"
import { Sparkles } from "@/components/ui/sparkles"
import { useRouter } from "next/navigation"
import { GlowButton } from "@/components/ui/glow-button"
import { NexusGeminiEffect } from "@/components/ui/nexus-gemini-effect"

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ")
}

// Logo components for the marquee
const Logos = {
  tailwindcss: () => (
    <svg className={"h-[28px] sm:w-auto w-[140px]"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 262 33">
      <path
        className={"fill-white"}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27 0C19.8 0 15.3 3.6 13.5 10.8C16.2 7.2 19.35 5.85 22.95 6.75C25.004 7.263 26.472 8.754 28.097 10.403C30.744 13.09 33.808 16.2 40.5 16.2C47.7 16.2 52.2 12.6 54 5.4C51.3 9 48.15 10.35 44.55 9.45C42.496 8.937 41.028 7.446 39.403 5.797C36.756 3.11 33.692 0 27 0ZM13.5 16.2C6.3 16.2 1.8 19.8 0 27C2.7 23.4 5.85 22.05 9.45 22.95C11.504 23.464 12.972 24.954 14.597 26.603C17.244 29.29 20.308 32.4 27 32.4C34.2 32.4 38.7 28.8 40.5 21.6C37.8 25.2 34.65 26.55 31.05 25.65C28.996 25.137 27.528 23.646 25.903 21.997C23.256 19.31 20.192 16.2 13.5 16.2Z"
      />
      <path
        className={"fill-white"}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M80.996 13.652H76.284V22.772C76.284 25.204 77.88 25.166 80.996 25.014V28.7C74.688 29.46 72.18 27.712 72.18 22.772V13.652H68.684V9.69996H72.18V4.59596L76.284 3.37996V9.69996H80.996V13.652ZM98.958 9.69996H103.062V28.7H98.958V25.964C97.514 27.978 95.272 29.194 92.308 29.194C87.14 29.194 82.846 24.824 82.846 19.2C82.846 13.538 87.14 9.20596 92.308 9.20596C95.272 9.20596 97.514 10.422 98.958 12.398V9.69996ZM92.954 25.28C96.374 25.28 98.958 22.734 98.958 19.2C98.958 15.666 96.374 13.12 92.954 13.12C89.534 13.12 86.95 15.666 86.95 19.2C86.95 22.734 89.534 25.28 92.954 25.28ZM109.902 6.84996C108.458 6.84996 107.28 5.63396 107.28 4.22796C107.281 3.53297 107.558 2.86682 108.049 2.37539C108.541 1.88395 109.207 1.60728 109.902 1.60596C110.597 1.60728 111.263 1.88395 111.755 2.37539C112.246 2.86682 112.523 3.53297 112.524 4.22796C112.524 5.63396 111.346 6.84996 109.902 6.84996ZM107.85 28.7V9.69996H111.954V28.7H107.85ZM116.704 28.7V0.959961H120.808V28.7H116.704ZM147.446 9.69996H151.778L145.812 28.7H141.784L137.832 15.894L133.842 28.7H129.814L123.848 9.69996H128.18L131.866 22.81L135.856 9.69996H139.77L143.722 22.81L147.446 9.69996ZM156.87 6.84996C155.426 6.84996 154.248 5.63396 154.248 4.22796C154.249 3.53297 154.526 2.86682 155.017 2.37539C155.509 1.88395 156.175 1.60728 156.87 1.60596C157.565 1.60728 158.231 1.88395 158.723 2.37539C159.214 2.86682 159.491 3.53297 159.492 4.22796C159.492 5.63396 158.314 6.84996 156.87 6.84996ZM154.818 28.7V9.69996H158.922V28.7H154.818ZM173.666 9.20596C177.922 9.20596 180.962 12.094 180.962 17.034V28.7H176.858V17.452C176.858 14.564 175.186 13.044 172.602 13.044C169.904 13.044 167.776 14.64 167.776 18.516V28.7H163.672V9.69996H167.776V12.132C169.03 10.156 171.082 9.20596 173.666 9.20596ZM200.418 2.09996H204.522V28.7H200.418V25.964C198.974 27.978 196.732 29.194 193.768 29.194C188.6 29.194 184.306 24.824 184.306 19.2C184.306 13.538 188.6 9.20596 193.768 9.20596C196.732 9.20596 198.974 10.422 200.418 12.398V2.09996ZM194.414 25.28C197.834 25.28 200.418 22.734 200.418 19.2C200.418 15.666 197.834 13.12 194.414 13.12C190.994 13.12 188.41 15.666 188.41 19.2C188.41 22.734 190.994 25.28 194.414 25.28ZM218.278 29.194C212.54 29.194 208.246 24.824 208.246 19.2C208.246 13.538 212.54 9.20596 218.278 9.20596C222.002 9.20596 225.232 11.144 226.752 14.108L223.218 16.16C222.382 14.374 220.52 13.234 218.24 13.234C214.896 13.234 212.35 15.78 212.35 19.2C212.35 22.62 214.896 25.166 218.24 25.166C220.52 25.166 222.382 23.988 223.294 22.24L226.828 24.254C225.232 27.256 222.002 29.194 218.278 29.194ZM233.592 14.944C233.592 18.402 243.814 16.312 243.814 23.342C243.814 27.142 240.508 29.194 236.404 29.194C232.604 29.194 229.868 27.484 228.652 24.748L232.186 22.696C232.794 24.406 234.314 25.432 236.404 25.432C238.228 25.432 239.634 24.824 239.634 23.304C239.634 19.922 229.412 21.822 229.412 15.02C229.412 11.448 232.49 9.20596 236.366 9.20596C239.482 9.20596 242.066 10.65 243.396 13.158L239.938 15.096C239.254 13.614 237.924 12.93 236.366 12.93C234.884 12.93 233.592 13.576 233.592 14.944ZM251.11 14.944C251.11 18.402 261.332 16.312 261.332 23.342C261.332 27.142 258.026 29.194 253.922 29.194C250.122 29.194 247.386 27.484 246.17 24.748L249.704 22.696C250.312 24.406 251.832 25.432 253.922 25.432C255.746 25.432 257.152 24.824 257.152 23.304C257.152 19.922 246.93 21.822 246.93 15.02C246.93 11.448 250.008 9.20596 253.884 9.20596C257 9.20596 259.584 10.65 260.914 13.158L257.456 15.096C256.772 13.614 255.442 12.93 253.884 12.93C252.402 12.93 251.11 13.576 251.11 14.944Z"
      />
    </svg>
  ),
  nextjs: () => (
    <svg className={"h-[20px] fill-white"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 394 79">
      <path d="M261.919 0.0330722H330.547V12.7H303.323V79.339H289.71V12.7H261.919V0.0330722Z"></path>
      <path d="M149.052 0.0330722V12.7H94.0421V33.0772H138.281V45.7441H94.0421V66.6721H149.052V79.339H80.43V12.7H80.4243V0.0330722H149.052Z"></path>
      <path d="M183.32 0.0661486H165.506L229.312 79.3721H247.178L215.271 39.7464L247.127 0.126654L229.312 0.154184L206.352 28.6697L183.32 0.0661486Z"></path>
      <path d="M201.6 56.7148L192.679 45.6229L165.455 79.4326H183.32L201.6 56.7148Z"></path>
      <path
        clipRule="evenodd"
        d="M80.907 79.339L17.0151 0H0V79.3059H13.6121V16.9516L63.8067 79.339H80.907Z"
        fillRule="evenodd"
      ></path>
      <path d="M333.607 78.8546C332.61 78.8546 331.762 78.5093 331.052 77.8186C330.342 77.1279 329.991 76.2917 330 75.3011C329.991 74.3377 330.342 73.5106 331.052 72.8199C331.762 72.1292 332.61 71.7838 333.607 71.7838C334.566 71.7838 335.405 72.1292 336.115 72.8199C336.835 73.5106 337.194 74.3377 337.204 75.3011C337.194 75.9554 337.028 76.5552 336.696 77.0914C336.355 77.6368 335.922 78.064 335.377 78.373C334.842 78.6911 334.252 78.8546 333.607 78.8546Z"></path>
      <path d="M356.84 45.4453H362.872V68.6846C362.863 70.8204 362.401 72.6472 361.498 74.1832C360.585 75.7191 359..321 76.8914 357.698 77.7185C356.084 78.5364 354.193 78.9546 352.044 78.9546C350.079 78.9546 348.318 78.6001 346.75 77.9094C345.182 77.2187 343.937 76.1826 343.024 74.8193C342.101 73.456 341.649 71.7565 341.649 69.7207H347.691C347.7 70.6114 347.903 71.3838 348.29 72.0291C348.677 72.6744 349.212 73.1651 349.895 73.5105C350.586 73.8559 351.38 74.0286 352.274 74.0286C353.243 74.0286 354.073 73.8286 354.746 73.4196C355.419 73.0197 355.936 72.4199 356.296 71.6201C356.646 70.8295 356.831 69.8479 356.84 68.6846V45.4453Z"></path>
      <path d="M387.691 54.5338C387.544 53.1251 386.898 52.0254 385.773 51.2438C384.638 50.4531 383.172 50.0623 381.373 50.0623C380.11 50.0623 379.022 50.2532 378.118 50.6258C377.214 51.0075 376.513 51.5164 376.033 52.1617C375.554 52.807 375.314 53.5432 375.295 54.3703C375.295 55.061 375.461 55.6608 375.784 56.1607C376.107 56.6696 376.54 57.0968 377.103 57.4422C377.656 57.7966 378.274 58.0874 378.948 58.3237C379.63 58.56 380.313 58.76 380.995 58.9236L384.14 59.6961C385.404 59.9869 386.631 60.3778 387.802 60.8776C388.973 61.3684 390.034 61.9955 390.965 62.7498C391.897 63.5042 392.635 64.413 393.179 65.4764C393.723 66.5397 394 67.7848 394 69.2208C394 71.1566 393.502 72.8562 392.496 74.3285C391.491 75.7917 390.043 76.9369 388.143 77.764C386.252 78.582 383.965 79 381.272 79C378.671 79 376.402 78.6002 374.493 77.8004C372.575 77.0097 371.08 75.8463 370.001 74.3194C368.922 72.7926 368.341 70.9294 368.258 68.7391H374.235C374.318 69.8842 374.687 70.8386 375.314 71.6111C375.95 72.3745 376.78 72.938 377.795 73.3197C378.819 73.6923 379.962 73.8832 381.226 73.8832C382.545 73.8832 383.707 73.6832 384.712 73.2924C385.708 72.9016 386.492 72.3564 387.055 71.6475C387.627 70.9476 387.913 70.1206 387.922 69.1754C387.913 68.312 387.654 67.5939 387.156 67.0304C386.649 66.467 385.948 65.9944 385.053 65.6127C384.15 65.231 383.098 64.8856 381.899 64.5857L378.081 63.6223C375.323 62.9225 373.137 61.8592 371.541 60.4323C369.937 59.0054 369.143 57.115 369.143 54.7429C369.143 52.798 369.678 51.0894 370.758 49.6261C371.827 48.1629 373.294 47.0268 375.148 46.2179C377.011 45.4 379.114 45 381.456 45C383.836 45 385.92 45.4 387.719 46.2179C389.517 47.0268 390.929 48.1538 391.952 49.5897C392.976 51.0257 393.511 52.6707 393.539 54.5338H387.691Z"></path>
    </svg>
  ),
  framer: () => (
    <div className={"h-fit flex items-center justify-start font-bold text-xl gap-3 text-white"}>
      <svg viewBox="0 0 14 21" role="presentation" className={"h-[30px] fill-white"}>
        <path d="M0 0h14v7H7zm0 7h7l7 7H7v7l-7-7z" fill="currentColor"></path>
      </svg>
      Motion
    </div>
  ),
  aws: () => (
    <svg className={"h-[40px] fill-white"} version="1.1" viewBox="-45.101 -44.95 390.872 269.7">
      <g transform="translate(-1.668 -1.1)">
        <path
          d="M86.4 66.4c0 3.7.4 6.7 1.1 8.9.8 2.2 1.8 4.6 3.2 7.2.5.8.7 1.6.7 2.3 0 1-.6 2-1.9 3L83.2 92c-.9.6-1.8.9-2.6.9-1 0-2-.5-3-1.4-1.4-1.5-2.6-3.1-3.6-4.7-1-1.7-2-3.6-3.1-5.9-7.8 9.2-17.6 13.8-29.4 13.8-8.4 0-15.1-2.4-20-7.2s-7.4-11.2-7.4-19.2c0-8.5 3-15.4 9.1-20.6s14.2-7.8 24.5-7.8c3.4 0 6.9.3 10.6.8s7.5 1.3 11.5 2.2v-7.3c0-7.6-1.6-12.9-4.7-16-3.2-3.1-8.6-4.6-16.3-4.6-3.5 0-7.1.4-10.8 1.3s-7.3 2-10.8 3.4c-1.6.7-2.8 1.1-3.5 1.3s-1.2.3-1.6.3c-1.4 0-2.1-1-2.1-3.1v-4.9c0-1.6.2-2.8.7-3.5s1.4-1.4 2.8-2.1c3.5-1.8 7.7-3.3 12.6-4.5C41 1.9 46.2 1.3 51.7 1.3c11.9 0 20.6 2.7 26.2 8.1 5.5 5.4 8.3 13.6 8.3 24.6v32.4zM45.8 81.6c3.3 0 6.7-.6 10.3-1.8s6.8-3.4 9.5-6.4c1.6-1.9 2.8-4 3.4-6.4s1-5.3 1-8.7v-4.2c-2.9-.7-6-1.3-9.2-1.7s-6.3-.6-9.4-.6c-6.7 0-11.6 1.3-14.9 4s-4.9 6.5-4.9 11.5c0 4.7 1.2 8.2 3.7 10.6 2.4 2.5 5.9 3.7 10.5 3.7m80.3 10.8c-1.8 0-3-.3-3.8-1-.8-.6-1.5-2-2.1-3.9L96.7 10.2c-.6-2-.9-3.3-.9-4 0-1.6.8-2.5 2.4-2.5h9.8c1.9 0 3.2.3 3.9 1 .8.6 1.4 2 2 3.9l16.8 66.2 15.6-66.2c.5-2 1.1-3.3 1.9-3.9s2.2-1 4-1h8c1.9 0 3.2.3 4 1 .8.6 1.5 2 1.9 3.9l15.8 67 17.3-67c.6-2 1.3-3.3 2-3.9.8-.6 2.1-1 3.9-1h9.3c1.6 0 2.5.8 2.5 2.5 0 .5-.1 1-.2 1.6s-.3 1.4-.7 2.5l-24.1 77.3c-.6 2-1.3 3.3-2.1 3.9-.8.6-2.1 1-3.8 1h-8.6c-1.9 0-3.2-.3-4-1s-1.5-2-1.9-4L156 23l-15.4 64.4c-.5 2-1.1 3.3-1.9 4s-2.2 1-4 1zm128.5 2.7c-5.2 0-10.4-.6-15.4-1.8s-8.9-2.5-11.5-4c-1.6-.9-2.7-1.9-3.1-2.8s-.6-1.9-.6-2.8v-5.1c0-2.1.8-3.1 2.3-3.1.6 0 1.2.1 1.8.3.6.2 1.5.6 2.5 1 3.4 1.5 7.1 2.7 11 3.5 4 .8 7.9 1.2 11.9 1.2 6.3 0 11.2-1.1 14.6-3.3s5.2-5.4 5.2-9.5c0-2.8-.9-5.1-2.7-7s-5.2-3.6-10.1-5.2L246 52c-7.3-2.3-12.7-5.7-16-10.2-3.3-4.4-5-9.3-5-14.5 0-4.2.9-7.9 2.7-11.1s4.2-6 7.2-8.2c3-2.3 6.4-4 10.4-5.2s8.2-1.7 12.6-1.7c2.2 0 4.5.1 6.7.4 2.3.3 4.4.7 6.5 1.1 2 .5 3.9 1 5.7 1.6s3.2 1.2 4.2 1.8c1.4.8 2.4 1.6 3 2.5.6.8.9 1.9.9 3.3v4.7c0 2.1-.8 3.2-2.3 3.2-.8 0-2.1-.4-3.8-1.2-5.7-2.6-12.1-3.9-19.2-3.9-5.7 0-10.2.9-13.3 2.8s-4.7 4.8-4.7 8.9c0 2.8 1 5.2 3 7.1s5.7 3.8 11 5.5l14.2 4.5c7.2 2.3 12.4 5.5 15.5 9.6s4.6 8.8 4.6 14c0 4.3-.9 8.2-2.6 11.6-1.8 3.4-4.2 6.4-7.3 8.8-3.1 2.5-6.8 4.3-11.1 5.6-4.5 1.4-9.2 2.1-14.3 2.1"
          className="fill-white"
        />
        <g>
          <path
            id="path1859"
            d="M273.5 143.7c-32.9 24.3-80.7 37.2-121.8 37.2-57.6 0-109.5-21.3-148.7-56.7-3.1-2.8-.3-6.6 3.4-4.4 42.4 24.6 94.7 39.5 148.8 39.5 36.5 0 76.6-7.6 113.5-23.2 5.5-2.5 10.2 3.6 4.8 7.6"
            className="fill-white"
          />
          <path
            d="M287.2 128.1c-4.2-5.4-27.8-2.6-38.5-1.3-3.2.4-3.7-2.4-.8-4.5 18.8-13.2 49.7-9.4 53.3-5 3.6 4.5-1 35.4-18.6 50.2-2.7 2.3-5.3 1.1-4.1-1.9 4-9.9 12.9-32.2 8.7-37.5"
            className="fill-white"
          />
        </g>
      </g>
    </svg>
  ),
  slack: () => (
    <span className="flex items-center whitespace-nowrap">
      Slack{" "}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.52118 7.58241C2.52118 8.27634 1.9544 8.8432 1.26059 8.8432C0.566777 8.8432 0 8.27634 0 7.58241C0 6.88849 0.566777 6.32162 1.26059 6.32162H2.52118V7.58241Z"
          fill="#E21E5B"
        ></path>
        <path
          d="M3.15625 7.5825C3.15625 6.88858 3.72303 6.32172 4.41684 6.32172C5.11065 6.32172 5.67743 6.88858 5.67743 7.5825V10.7394C5.67743 11.4333 5.11065 12.0002 4.41684 12.0002C3.72303 12.0002 3.15625 11.4333 3.15625 10.7394V7.5825Z"
          fill="#E21E5B"
        ></path>
        <path
          d="M4.41684 2.52164C3.72303 2.52164 3.15625 1.95477 3.15625 1.26085C3.15625 0.566928 3.72303 6.10352e-05 4.41684 6.10352e-05C5.11065 6.10352e-05 5.67743 0.566928 5.67743 1.26085V2.52164H4.41684Z"
          fill="#36C6F0"
        ></path>
        <path
          d="M4.41695 3.15518C5.11076 3.15518 5.67754 3.72205 5.67754 4.41597C5.67754 5.10989 5.11076 5.67676 4.41695 5.67676H1.26059C0.566777 5.67676 0 5.10989 0 4.41597C0 3.72205 0.566777 3.15518 1.26059 3.15518H4.41695Z"
          fill="#36C6F0"
        ></path>
        <path
          d="M9.48047 4.41719C9.48047 3.72327 10.0472 3.1564 10.7411 3.1564C11.4349 3.1564 12.0016 3.72327 12.0016 4.41719C12.0016 5.11111 11.4349 5.67798 10.7411 5.67798H9.48047V4.41719Z"
          fill="#2EB77D"
        ></path>
        <path
          d="M8.8454 4.41765C8.8454 5.11157 8.27862 5.67844 7.58481 5.67844C6.89099 5.67844 6.32422 5.11157 6.32422 4.41765V1.26079C6.32422 0.566867 6.89099 0 7.58481 0C8.27862 0 8.8454 0.566867 8.8454 1.26079V4.41765Z"
          fill="#2EB77D"
        ></path>
        <path
          d="M7.58481 9.47812C8.27862 9.47812 8.8454 10.045 8.8454 10.7389C8.8454 11.4328 8.27862 11.9997 7.58481 11.9997C6.89099 11.9997 6.32422 11.4328 6.32422 10.7389V9.47812H7.58481Z"
          fill="#ECB22D"
        ></path>
        <path
          d="M7.58481 8.8432C6.89099 8.8432 6.32422 8.27634 6.32422 7.58241C6.32422 6.88849 6.89099 6.32162 7.58481 6.32162H10.7412C11.435 6.32162 12.0018 6.88849 12.0018 7.58241C12.0018 8.27634 11.435 8.8432 10.7412 8.8432H7.58481Z"
          fill="#ECB22D"
        ></path>
      </svg>
    </span>
  ),
  discord: () => (
    <span className="flex items-center whitespace-nowrap">
      Discord{" "}
      <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
        <path
          d="M11.6783 1.68101C10.8179 1.28619 9.89518 0.995304 8.93044 0.828702C8.91287 0.825486 8.89532 0.833522 8.88627 0.849593C8.76761 1.06066 8.63616 1.33601 8.54411 1.55243C7.50648 1.39708 6.47417 1.39708 5.45781 1.55243C5.36574 1.3312 5.22952 1.06066 5.11032 0.849593C5.10127 0.834058 5.08372 0.826023 5.06615 0.828702C4.10195 0.994772 3.17925 1.28566 2.31828 1.68101C2.31082 1.68422 2.30443 1.68959 2.30019 1.69655C0.550033 4.31133 0.0705905 6.86184 0.305789 9.38073C0.306853 9.39305 0.313771 9.40484 0.323349 9.41233C1.47805 10.2603 2.59659 10.7752 3.69434 11.1164C3.71191 11.1218 3.73053 11.1153 3.74171 11.1009C4.00138 10.7462 4.23286 10.3723 4.43133 9.9791C4.44304 9.95607 4.43186 9.92875 4.40792 9.91964C4.04076 9.78036 3.69115 9.61054 3.35485 9.41769C3.32825 9.40216 3.32612 9.36411 3.35059 9.34589C3.42136 9.29286 3.49215 9.23768 3.55972 9.18197C3.57195 9.17179 3.58899 9.16965 3.60336 9.17607C5.81272 10.1848 8.20462 10.1848 10.3879 9.17607C10.4023 9.16911 10.4193 9.17126 10.4321 9.18143C10.4997 9.23715 10.5704 9.29286 10.6417 9.34589C10.6662 9.36411 10.6646 9.40216 10.638 9.41769C10.3017 9.61428 9.95211 9.78036 9.58441 9.91911C9.56047 9.92822 9.54983 9.95607 9.56154 9.9791C9.76427 10.3718 9.99574 10.7457 10.2506 11.1003C10.2613 11.1153 10.2804 11.1218 10.298 11.1164C11.4011 10.7752 12.5196 10.2603 13.6743 9.41233C13.6844 9.40484 13.6908 9.39358 13.6919 9.38126C13.9734 6.46915 13.2204 3.93955 11.6959 1.69655Z"
          fill="#5865F2"
        ></path>
      </svg>
    </span>
  ),
}

interface RotatingTextRef {
  next: () => void
  previous: () => void
  jumpTo: (index: number) => void
  reset: () => void
}

interface RotatingTextProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof motion.span>,
    "children" | "transition" | "initial" | "animate" | "exit"
  > {
  texts: string[]
  transition?: Transition
  initial?: boolean | Target | VariantLabels
  animate?: boolean | VariantLabels | AnimationControls | TargetAndTransition
  exit?: Target | VariantLabels
  animatePresenceMode?: "sync" | "wait"
  animatePresenceInitial?: boolean
  rotationInterval?: number
  staggerDuration?: number
  staggerFrom?: "first" | "last" | "center" | "random" | number
  loop?: boolean
  auto?: boolean
  splitBy?: "characters" | "words" | "lines" | string
  onNext?: (index: number) => void
  mainClassName?: string
  splitLevelClassName?: string
  elementLevelClassName?: string
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      rotationInterval = 2200,
      staggerDuration = 0.01,
      staggerFrom = "last",
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      ...rest
    },
    ref,
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0)

    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        try {
          const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" })
          return Array.from(segmenter.segment(text), (segment) => segment.segment)
        } catch (error) {
          console.error("Intl.Segmenter failed, falling back to simple split:", error)
          return text.split("")
        }
      }
      return text.split("")
    }

    const elements = useMemo(() => {
      const currentText: string = texts[currentTextIndex] ?? ""
      if (splitBy === "characters") {
        const words = currentText.split(/(\s+)/)
        let charCount = 0
        return words
          .filter((part) => part.length > 0)
          .map((part) => {
            const isSpace = /^\s+$/.test(part)
            const chars = isSpace ? [part] : splitIntoCharacters(part)
            const startIndex = charCount
            charCount += chars.length
            return { characters: chars, isSpace: isSpace, startIndex: startIndex }
          })
      }
      if (splitBy === "words") {
        return currentText
          .split(/(\s+)/)
          .filter((word) => word.length > 0)
          .map((word, i) => ({
            characters: [word],
            isSpace: /^\s+$/.test(word),
            startIndex: i,
          }))
      }
      if (splitBy === "lines") {
        return currentText.split("\n").map((line, i) => ({
          characters: [line],
          isSpace: false,
          startIndex: i,
        }))
      }
      return currentText.split(splitBy).map((part, i) => ({
        characters: [part],
        isSpace: false,
        startIndex: i,
      }))
    }, [texts, currentTextIndex, splitBy])

    const totalElements = useMemo(() => elements.reduce((sum, el) => sum + el.characters.length, 0), [elements])

    const getStaggerDelay = useCallback(
      (index: number, total: number): number => {
        if (total <= 1 || !staggerDuration) return 0
        const stagger = staggerDuration
        switch (staggerFrom) {
          case "first":
            return index * stagger
          case "last":
            return (total - 1 - index) * stagger
          case "center":
            const center = (total - 1) / 2
            return Math.abs(center - index) * stagger
          case "random":
            return Math.random() * (total - 1) * stagger
          default:
            if (typeof staggerFrom === "number") {
              const fromIndex = Math.max(0, Math.min(staggerFrom, total - 1))
              return Math.abs(fromIndex - index) * stagger
            }
            return index * stagger
        }
      },
      [staggerFrom, staggerDuration],
    )

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex)
        onNext?.(newIndex)
      },
      [onNext],
    )

    const next = useCallback(() => {
      const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1
      if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex)
    }, [currentTextIndex, texts.length, loop, handleIndexChange])

    const previous = useCallback(() => {
      const prevIndex = currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1
      if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex)
    }, [currentTextIndex, texts.length, loop, handleIndexChange])

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1))
        if (validIndex !== currentTextIndex) handleIndexChange(validIndex)
      },
      [texts.length, currentTextIndex, handleIndexChange],
    )

    const reset = useCallback(() => {
      if (currentTextIndex !== 0) handleIndexChange(0)
    }, [currentTextIndex, handleIndexChange])

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset])

    useEffect(() => {
      if (!auto || texts.length <= 1) return
      const intervalId = setInterval(next, rotationInterval)
      return () => clearInterval(intervalId)
    }, [next, rotationInterval, auto, texts.length])

    return (
      <motion.span
        className={cn("inline-flex flex-wrap whitespace-pre-wrap relative align-bottom pb-[10px]", mainClassName)}
        {...rest}
        layout
      >
        <span className="sr-only">{texts[currentTextIndex]}</span>
        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.div
            key={currentTextIndex}
            className={cn(
              "inline-flex flex-wrap relative",
              splitBy === "lines" ? "flex-col items-start w-full" : "flex-row items-baseline",
            )}
            layout
            aria-hidden="true"
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {elements.map((elementObj, elementIndex) => (
              <span
                key={elementIndex}
                className={cn("inline-flex", splitBy === "lines" ? "w-full" : "", splitLevelClassName)}
                style={{ whiteSpace: "pre" }}
              >
                {elementObj.characters.map((char, charIndex) => {
                  const globalIndex = elementObj.startIndex + charIndex
                  return (
                    <motion.span
                      key={`${char}-${charIndex}`}
                      initial={initial}
                      animate={animate}
                      exit={exit}
                      transition={{
                        ...transition,
                        delay: getStaggerDelay(globalIndex, totalElements),
                      }}
                      className={cn("inline-block leading-none tracking-tight", elementLevelClassName)}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  )
                })}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.span>
    )
  },
)
RotatingText.displayName = "RotatingText"

const ShinyText: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => (
  <span className={cn("relative overflow-hidden inline-block", className)}>
    {text}
    <span
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        animation: "shine 2s infinite linear",
        opacity: 0.5,
        pointerEvents: "none",
      }}
    ></span>
    <style>{`
            @keyframes shine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `}</style>
  </span>
)

const ChevronDownIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-3 h-3 ml-1 inline-block transition-transform duration-200 group-hover:rotate-180"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
)

const MenuIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
)

const CloseIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

const ExternalLinkIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
    />
  </svg>
)

interface NavLinkProps {
  href?: string
  children: ReactNode
  hasDropdown?: boolean
  className?: string
  onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void
}

const NavLink: React.FC<NavLinkProps> = ({ href = "#", children, hasDropdown = false, className = "", onClick }) => (
  <motion.a
    href={href}
    onClick={onClick}
    className={cn(
      "relative group text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 flex items-center py-1",
      className,
    )}
    whileHover="hover"
  >
    {children}
    {hasDropdown && <ChevronDownIcon />}
    {!hasDropdown && (
      <motion.div
        className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-[#0CF2A0]"
        variants={{ initial: { scaleX: 0, originX: 0.5 }, hover: { scaleX: 1, originX: 0.5 } }}
        initial="initial"
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    )}
  </motion.a>
)

interface DropdownMenuProps {
  children: ReactNode
  isOpen: boolean
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, isOpen }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 origin-top z-40"
      >
        <div className="bg-[#111111] border border-gray-700/50 rounded-md shadow-xl p-2">{children}</div>
      </motion.div>
    )}
  </AnimatePresence>
)

interface DropdownItemProps {
  href?: string
  children: ReactNode
  icon?: React.ReactElement<SVGProps<SVGSVGElement>>
}

const DropdownItem: React.FC<DropdownItemProps> = ({ href = "#", children, icon }) => (
  <a
    href={href}
    className="group flex items-center justify-between w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/30 hover:text-white rounded-md transition-colors duration-150"
  >
    <span>{children}</span>
    {icon &&
      React.cloneElement(icon, { className: "w-4 h-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" })}
  </a>
)

interface Dot {
  x: number
  y: number
  baseColor: string
  targetOpacity: number
  currentOpacity: number
  opacitySpeed: number
  baseRadius: number
  currentRadius: number
}

const InteractiveHero: React.FC = () => {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState<boolean>(false)

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10)
  })

  const dotsRef = useRef<Dot[]>([])
  const gridRef = useRef<Record<string, number[]>>({})
  const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 })
  const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })

  const DOT_SPACING = 25
  const BASE_OPACITY_MIN = 0.4
  const BASE_OPACITY_MAX = 0.5
  const BASE_RADIUS = 1
  const INTERACTION_RADIUS = 150
  const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS
  const OPACITY_BOOST = 0.6
  const RADIUS_BOOST = 2.5
  const GRID_CELL_SIZE = Math.max(50, Math.floor(INTERACTION_RADIUS / 1.5))

  const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) {
      mousePositionRef.current = { x: null, y: null }
      return
    }
    const rect = canvas.getBoundingClientRect()
    const canvasX = event.clientX - rect.left
    const canvasY = event.clientY - rect.top
    mousePositionRef.current = { x: canvasX, y: canvasY }
  }, [])

  const createDots = useCallback(() => {
    const { width, height } = canvasSizeRef.current
    if (width === 0 || height === 0) return

    const newDots: Dot[] = []
    const newGrid: Record<string, number[]> = {}
    const cols = Math.ceil(width / DOT_SPACING)
    const rows = Math.ceil(height / DOT_SPACING)

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * DOT_SPACING + DOT_SPACING / 2
        const y = j * DOT_SPACING + DOT_SPACING / 2
        const cellX = Math.floor(x / GRID_CELL_SIZE)
        const cellY = Math.floor(y / GRID_CELL_SIZE)
        const cellKey = `${cellX}_${cellY}`

        if (!newGrid[cellKey]) {
          newGrid[cellKey] = []
        }

        const dotIndex = newDots.length
        newGrid[cellKey].push(dotIndex)

        const baseOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN
        newDots.push({
          x,
          y,
          baseColor: `rgba(87, 220, 205, ${BASE_OPACITY_MAX})`,
          targetOpacity: baseOpacity,
          currentOpacity: baseOpacity,
          opacitySpeed: Math.random() * 0.005 + 0.002,
          baseRadius: BASE_RADIUS,
          currentRadius: BASE_RADIUS,
        })
      }
    }
    dotsRef.current = newDots
    gridRef.current = newGrid
  }, [DOT_SPACING, GRID_CELL_SIZE, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS])

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    const width = container ? container.clientWidth : window.innerWidth
    const height = container ? container.clientHeight : window.innerHeight

    if (
      canvas.width !== width ||
      canvas.height !== height ||
      canvasSizeRef.current.width !== width ||
      canvasSizeRef.current.height !== height
    ) {
      canvas.width = width
      canvas.height = height
      canvasSizeRef.current = { width, height }
      createDots()
    }
  }, [createDots])

  const animateDots = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    const dots = dotsRef.current
    const grid = gridRef.current
    const { width, height } = canvasSizeRef.current
    const { x: mouseX, y: mouseY } = mousePositionRef.current

    if (!ctx || !dots || !grid || width === 0 || height === 0) {
      animationFrameId.current = requestAnimationFrame(animateDots)
      return
    }

    ctx.clearRect(0, 0, width, height)

    const activeDotIndices = new Set<number>()
    if (mouseX !== null && mouseY !== null) {
      const mouseCellX = Math.floor(mouseX / GRID_CELL_SIZE)
      const mouseCellY = Math.floor(mouseY / GRID_CELL_SIZE)
      const searchRadius = Math.ceil(INTERACTION_RADIUS / GRID_CELL_SIZE)
      for (let i = -searchRadius; i <= searchRadius; i++) {
        for (let j = -searchRadius; j <= searchRadius; j++) {
          const checkCellX = mouseCellX + i
          const checkCellY = mouseCellY + j
          const cellKey = `${checkCellX}_${checkCellY}`
          if (grid[cellKey]) {
            grid[cellKey].forEach((dotIndex) => activeDotIndices.add(dotIndex))
          }
        }
      }
    }

    dots.forEach((dot, index) => {
      dot.currentOpacity += dot.opacitySpeed
      if (dot.currentOpacity >= dot.targetOpacity || dot.currentOpacity <= BASE_OPACITY_MIN) {
        dot.opacitySpeed = -dot.opacitySpeed
        dot.currentOpacity = Math.max(BASE_OPACITY_MIN, Math.min(dot.currentOpacity, BASE_OPACITY_MAX))
        dot.targetOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN
      }

      let interactionFactor = 0
      dot.currentRadius = dot.baseRadius

      if (mouseX !== null && mouseY !== null && activeDotIndices.has(index)) {
        const dx = dot.x - mouseX
        const dy = dot.y - mouseY
        const distSq = dx * dx + dy * dy

        if (distSq < INTERACTION_RADIUS_SQ) {
          const distance = Math.sqrt(distSq)
          interactionFactor = Math.max(0, 1 - distance / INTERACTION_RADIUS)
          interactionFactor = interactionFactor * interactionFactor
        }
      }

      const finalOpacity = Math.min(1, dot.currentOpacity + interactionFactor * OPACITY_BOOST)
      dot.currentRadius = dot.baseRadius + interactionFactor * RADIUS_BOOST

      const colorMatch = dot.baseColor.match(/rgba?$$(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?$$/)
      const r = colorMatch ? colorMatch[1] : "87"
      const g = colorMatch ? colorMatch[2] : "220"
      const b = colorMatch ? colorMatch[3] : "205"

      ctx.beginPath()
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`
      ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2)
      ctx.fill()
    })

    animationFrameId.current = requestAnimationFrame(animateDots)
  }, [
    GRID_CELL_SIZE,
    INTERACTION_RADIUS,
    INTERACTION_RADIUS_SQ,
    OPACITY_BOOST,
    RADIUS_BOOST,
    BASE_OPACITY_MIN,
    BASE_OPACITY_MAX,
    BASE_RADIUS,
  ])

  useEffect(() => {
    handleResize()
    const canvasElement = canvasRef.current
    const handleMouseLeave = () => {
      mousePositionRef.current = { x: null, y: null }
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("resize", handleResize)
    document.documentElement.addEventListener("mouseleave", handleMouseLeave)

    animationFrameId.current = requestAnimationFrame(animateDots)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [handleResize, handleMouseMove, animateDots])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  const headerVariants: Variants = {
    top: {
      backgroundColor: "rgba(17, 17, 17, 0.8)",
      borderBottomColor: "rgba(55, 65, 81, 0.5)",
      position: "fixed",
      boxShadow: "none",
    },
    scrolled: {
      backgroundColor: "rgba(17, 17, 17, 0.95)",
      borderBottomColor: "rgba(75, 85, 99, 0.7)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      position: "fixed",
    },
  }

  const mobileMenuVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.15, ease: "easeIn" } },
  }

  const contentDelay = 0.3
  const itemDelayIncrement = 0.1

  const bannerVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: contentDelay } },
  }
  const headlineVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement } },
  }
  const subHeadlineVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 2 } },
  }
  const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 3 } },
  }

  const productButtonVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 3.2 } },
  }

  const trialTextVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 4 } },
  }
  const worksWithVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 5 } },
  }
  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, delay: contentDelay + itemDelayIncrement * 6, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const { theme } = useTheme()

  const handleDemoClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    router.push("/demo")
  }

  return (
    <div className="pt-[100px] relative bg-[#111111] text-gray-300 min-h-screen flex flex-col overflow-x-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-80" />
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, #111111 90%), radial-gradient(ellipse at center, transparent 40%, #111111 95%)",
        }}
      ></div>

      <motion.header
        variants={headerVariants}
        initial="top"
        animate={isScrolled ? "scrolled" : "top"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="px-6 w-full md:px-10 lg:px-16 sticky top-0 z-30 backdrop-blur-md border-b"
      >
        <nav className="flex justify-between items-center max-w-screen-xl mx-auto h-[70px]">
          <div className="flex items-center flex-shrink-0 relative">
            <div className="absolute -inset-4 bg-[radial-gradient(circle_at_center,#0CF2A0_5%,rgba(12,242,160,0.5)_30%,rgba(12,242,160,0.1)_60%,transparent_80%)] opacity-70 blur-md z-0"></div>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="#0CF2A0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="#0CF2A0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#0CF2A0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xl font-bold text-white ml-2 relative z-10">Nexus</span>
          </div>

          <div className="hidden md:flex items-center justify-center flex-grow space-x-6 lg:space-x-8 px-4">
            <NavLink href="/product">Product</NavLink>
            <NavLink href="#">Customers</NavLink>

            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("channels")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <NavLink href="#" hasDropdown>
                Channels
              </NavLink>
              <DropdownMenu isOpen={openDropdown === "channels"}>
                <DropdownItem href="#">Slack</DropdownItem>
                <DropdownItem href="#">Microsoft Teams</DropdownItem>
                <DropdownItem href="#">Discord</DropdownItem>
                <DropdownItem href="#">Email</DropdownItem>
                <DropdownItem href="#">Web Chat</DropdownItem>
              </DropdownMenu>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown("resources")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <NavLink href="#" hasDropdown>
                Resources
              </NavLink>
              <DropdownMenu isOpen={openDropdown === "resources"}>
                <DropdownItem href="#" icon={<ExternalLinkIcon />}>
                  Blog
                </DropdownItem>
                <DropdownItem href="#">Guides</DropdownItem>
                <DropdownItem href="#">Help Center</DropdownItem>
                <DropdownItem href="#">API Reference</DropdownItem>
              </DropdownMenu>
            </div>

            <NavLink href="#">Docs</NavLink>
            <NavLink href="#">Pricing</NavLink>
          </div>

          <div className="flex items-center flex-shrink-0 space-x-4 lg:space-x-6">
            <NavLink href="#" className="hidden md:inline-block">
              Sign in
            </NavLink>

            <motion.a
              href="/demo"
              onClick={handleDemoClick}
              className="bg-[#0CF2A0] text-[#111111] px-4 py-[6px] rounded-md text-sm font-semibold hover:bg-opacity-90 transition-colors duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              Book a demo
            </motion.a>

            <motion.button
              className="md:hidden text-gray-300 hover:text-white z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </motion.button>
          </div>
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden absolute top-full left-0 right-0 bg-[#111111]/95 backdrop-blur-sm shadow-lg py-4 border-t border-gray-800/50"
            >
              <div className="flex flex-col items-center space-y-4 px-6">
                <NavLink href="/product" onClick={() => setIsMobileMenuOpen(false)}>
                  Product
                </NavLink>
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Customers
                </NavLink>
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Channels
                </NavLink>
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Resources
                </NavLink>
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Docs
                </NavLink>
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Pricing
                </NavLink>
                <hr className="w-full border-t border-gray-700/50 my-2" />
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign in
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-8 pb-16 relative z-10">
        <motion.div variants={bannerVariants} initial="hidden" animate="visible" className="mb-6">
          <ShinyText
            text="Announcing our $15M Series A"
            className="bg-[#1a1a1a] border border-gray-700 text-[#0CF2A0] px-4 py-1 rounded-full text-xs sm:text-sm font-medium cursor:pointer hover:border-[#0CF2A0]/50 transition-colors"
          />
        </motion.div>

        <motion.h1
          variants={headlineVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl lg:text-[64px] font-semibold text-white leading-tight max-w-4xl mb-4"
        >
          Deliver collaborative
          <br />{" "}
          <span className="inline-block h-[1.2em] sm:h-[1.2em] lg:h-[1.2em] overflow-hidden align-bottom">
            <RotatingText
              texts={["Support", "Experiences", "Relationships", "Help", "Service"]}
              mainClassName="text-[#0CF2A0] mx-1"
              staggerFrom={"last"}
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "110%", opacity: 0 }}
              staggerDuration={0.01}
              transition={{ type: "spring", damping: 18, stiffness: 250 }}
              rotationInterval={2200}
              splitBy="characters"
              auto={true}
              loop={true}
            />
          </span>
        </motion.h1>

        <motion.p
          variants={subHeadlineVariants}
          initial="hidden"
          animate="visible"
          className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-8"
        >
          Support your customers on Slack, Microsoft Teams, Discord and many more – and move from answering tickets to
          building genuine relationships.
        </motion.p>

        <motion.div
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center gap-4 mb-3"
        >
          <GlowButton onClick={() => router.push("/get-started")}>Get Started</GlowButton>
          <motion.button
            onClick={() => router.push("/product")}
            variants={productButtonVariants}
            initial="hidden"
            animate="visible"
            className="px-6 py-3 rounded-md text-white border border-[#0CF2A0]/40 bg-[#111111]/80 backdrop-blur-sm hover:bg-[#111111] hover:border-[#0CF2A0]/70 transition-all duration-300 font-medium relative group"
          >
            Product
            <span className="absolute inset-0 bg-[#0CF2A0]/10 opacity-0 group-hover:opacity-100 rounded-md transition-opacity duration-300"></span>
          </motion.button>
        </motion.div>

        <motion.p
          variants={trialTextVariants}
          initial="hidden"
          animate="visible"
          className="text-xs text-gray-500 mb-2"
        >
          Free 14 day trial
        </motion.p>

        <motion.div variants={imageVariants} initial="hidden" animate="visible" className="w-full">
          <NexusGeminiEffect />
        </motion.div>

        <motion.div
          variants={worksWithVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center space-y-2 mb-10"
        >
          <span className="text-xs uppercase text-gray-500 tracking-wider font-medium">Works with</span>
          <InfiniteSlider className="flex h-full w-full items-center" duration={30} gap={48}>
            {[Logos.tailwindcss, Logos.framer, Logos.nextjs, Logos.aws, Logos.slack, Logos.discord].map(
              (Logo, index) => (
                <div key={index} className="w-32 relative h-full flex items-center justify-start">
                  <Logo />
                </div>
              ),
            )}
          </InfiniteSlider>
          <ProgressiveBlur
            className="pointer-events-none absolute top-0 left-0 h-full w-[200px]"
            direction="left"
            blurIntensity={1}
          />
          <ProgressiveBlur
            className="pointer-events-none absolute top-0 right-0 h-full w-[200px]"
            direction="right"
            blurIntensity={1}
          />
        </motion.div>

        <div className="relative -mt-10 h-48 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]">
          <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#0CF2A0,transparent_70%)] before:opacity-70" />
          <div className="absolute -left-1/2 top-1/2 aspect-[1/0.7] z-10 w-[200%] rounded-[100%] border-t border-zinc-900/20 dark:border-white/20 bg-white dark:bg-zinc-900" />
          <Sparkles
            density={1200}
            className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
            color={theme === "dark" ? "#ffffff" : "#000000"}
          />
        </div>

        <p className="text-xs text-gray-500">
          Nexus is not affiliated with or endorsed by any of the companies listed above.
        </p>
      </main>
    </div>
  )
}

export default InteractiveHero
