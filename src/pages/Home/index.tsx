import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {  Layout } from "antd";

function Home(): JSX.Element {
  const counter = useSelector((state: RootState) => state.counter);

  console.log(counter);

  return (
    <Layout.Content style={{minHeight:1500}}>
      Home content
    </Layout.Content>
  );
}

export default Home;
