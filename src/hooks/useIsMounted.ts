import { useRef, useEffect, MutableRefObject } from "react";

export default function useIsMounted(): MutableRefObject<boolean> {
  const isMounted = useRef(false);

  useEffect((): (() => void) => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);

  return isMounted;
}
