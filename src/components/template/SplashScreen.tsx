// Local Imports
import { APP_FAVICON } from "@/constants/app";
import { Progress } from "@/components/ui";

// ----------------------------------------------------------------------




export function SplashScreen() {
  return (
    <div className="fixed grid h-full w-full place-content-center">
      <Progress
        circular
        isIndeterminate
        color="primary"
        size={144}
        strokeWidth={4}
        animationDuration="1s"
      >
        {/* <img
          src={`${import.meta.env.BASE_URL}fevicon.png`}
          alt="KrushiMall"
          className="size-20 object-contain"
        /> */}
         <img
          src={APP_FAVICON}
          alt="Ticket Book"
          className="h-28 w-auto object-contain"
        />
      </Progress>
    </div>
  );
}