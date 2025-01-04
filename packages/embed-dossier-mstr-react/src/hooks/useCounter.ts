import { useState } from "react";

export const useCounter = (initial = 0) => {
  const [count, setCount] = useState(initial);
  return { count, setCount };
};
