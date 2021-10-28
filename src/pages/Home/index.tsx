import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Layout } from "antd";
import Wrapper from "./index.style";

function Home(): JSX.Element {
  const counter = useSelector((state: RootState) => state.counter);

  console.log(counter);

  return (
    <Layout.Content style={{ minHeight: 1500 }}>
      <Wrapper>
        <h1> Home content</h1>
      </Wrapper>
    </Layout.Content>
  );
}

export default Home;
