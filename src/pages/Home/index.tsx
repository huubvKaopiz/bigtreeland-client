import React from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../store/store";
import { decrement, increment } from "../../store/counter/slice";
import Wrapper from "./index.style";
import { Button } from "antd";

function Home(): JSX.Element {
  const counter = useSelector((state: RootState) => state.counter);
  const dispatch = useAppDispatch();

  console.log(counter);

  return (
    <Wrapper>
      <h1>Redux demo</h1>
      <div>
        <Button
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
          type="primary"
        >
          Increment
        </Button>
        <span>{counter.value}</span>
        <Button
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
          type="default"
        >
          Decrement
        </Button>
      </div>
    </Wrapper>
  );
}

export default Home;
