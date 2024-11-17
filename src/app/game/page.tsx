/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";
import { useRef, useState, useEffect } from "react";

interface Circle {
  id: number;
  countdown: number;
  x: number;
  y: number;
  rgba: number;
}

function GamePage() {
  const [isStart, setIsStart] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [curPoint, setCurPoint] = useState<number>(0);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [isOver, setIsOver] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [isFinish, setIsFinish] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const circleIntervals = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const autoPlayCircleTimeOuts = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const startCounter = (): void => {
    if (inputRef.current) {
      const value = Number(inputRef.current.value);
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const newCircles: Circle[] = Array.from(
          { length: value },
          (_, index) => ({
            id: index + 1,
            countdown: 3,
            x: getRandomNumber(width - 200),
            y: getRandomNumber(height - 50),
            rgba: 1,
          })
        );
        setCircles(newCircles);
      }
    }

    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setCount((prevCount) => Math.round((prevCount + 0.1) * 10) / 10);
    }, 100);
  };

  const stopCounter = (): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopAllCircleIntervals = (): void => {
    circleIntervals.current.forEach((intervalId) => clearInterval(intervalId));
    circleIntervals.current.clear();
  };

  const handleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);

    if (!isAutoPlay) {
      let extraTime = 0;
      circles?.map((circle) => {
        if (circle?.id > curPoint) {
          extraTime += 1000;
          const timeOut = setTimeout(() => {
            (document.getElementById(`${circle?.id}`) as HTMLElement)?.click();
          }, extraTime);
          autoPlayCircleTimeOuts.current.set(circle?.id, timeOut);
        }
      });
    } else {
      autoPlayCircleTimeOuts.current.forEach((timeOutId) =>
        clearTimeout(timeOutId)
      );
      autoPlayCircleTimeOuts.current.clear();
    }
  };

  const handleClick = (id: number): void => {
    if (id != curPoint + 1) {
      setIsOver(true);
      stopCounter();
      return;
    }
    setCurPoint(id);
    const interval = setInterval(() => {
      setCircles((prev) =>
        prev.map((circle) =>
          circle.id === id
            ? { ...circle, countdown: circle.countdown - 0.1 }
            : circle
        )
      );
    }, 100);

    circleIntervals.current.set(id, interval);

    setTimeout(() => {
      clearInterval(interval);
      circleIntervals.current.delete(id);
    }, 3000);
  };

  useEffect(() => {
    if (
      curPoint == circles[circles?.length - 1]?.id &&
      Number(circles[circles?.length - 1]?.countdown.toFixed(1)) <= 0.1
    ) {
      stopCounter();
      setIsFinish(true);
    }
  }, [curPoint, circles]);

  useEffect(() => {
    if (isOver) {
      stopAllCircleIntervals();
    }
  }, [isOver]);

  const getRandomNumber = (max: number): number => {
    return Math.floor(Math.random() * max);
  };

  return (
    <div className="p-8">
      <div className="w-1/2 grid gap-4">
        {isOver ? (
          <p className="font-bold text-orange-700 ">GAME OVER</p>
        ) : isFinish ? (
          <p className="font-bold text-green-600 ">ALL CLEARED</p>
        ) : (
          <p className="font-bold ">LET&apos;S PLAY</p>
        )}

        <div className="flex justify-between">
          <p className="">Points:</p>
          <input
            className="border-solid border px-2 border-black"
            ref={inputRef}
            type="number"
          />
        </div>
        <div className="flex justify-between">
          <p className="">Time:</p>
          <p>{count}s</p>
        </div>
        <div className="flex justify-between">
          {!isStart ? (
            <button
              type="button"
              className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-900"
              onClick={() => {
                if (inputRef?.current?.value) {
                  setIsStart(true);
                  startCounter();
                }
              }}
            >
              Play
            </button>
          ) : (
            <>
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                onClick={() => {
                  stopCounter();
                  setCount(0);
                  intervalRef.current = null;
                  setIsStart(false);
                  setIsOver(false);
                  setCurPoint(0);
                  setIsFinish(false);
                  if (inputRef?.current) {
                    inputRef.current.value = "";
                  }
                }}
              >
                Restart
              </button>

              {!isFinish && (
                <button
                  type="button"
                  className="focus:outline-none text-white bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-900"
                  onClick={handleAutoPlay}
                >
                  Auto Play {!isAutoPlay ? "ON" : "OFF"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div
        className="h-96 relative border border-solid border-black"
        ref={containerRef}
      >
        {circles.map((circle) => (
          <div
            key={circle.id}
            id={`${circle.id}`}
            className="p-2 px-4 cursor-pointer absolute border border-solid border-orange-700 rounded-full"
            style={{
              top: `${circle.y}px`,
              left: `${circle.x}px`,
              opacity: circle.countdown <= 0 ? "0" : "1",
              pointerEvents: circle.countdown <= 0 || isOver ? "none" : "unset",
              backgroundColor:
                circle.countdown <= 2.9
                  ? `rgb(194, 65, 12,${circle?.rgba})`
                  : "#fff",
              zIndex: circles?.length - circle?.id,
            }}
            onClick={() => handleClick(circle.id)}
          >
            <p className="text-center">{circle.id}</p>
            {Number(circle.countdown.toFixed(1)) < 3 ? (
              <p className="text-white"> {circle.countdown.toFixed(1)}s</p>
            ) : (
              ""
            )}
          </div>
        ))}
      </div>
      <p>
        {" "}
        {curPoint && !isOver && curPoint < circles[circles?.length - 1]?.id
          ? `Next: ${curPoint + 1}`
          : ""}
      </p>
    </div>
  );
}

export default GamePage;
