import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {  Layout } from "antd";

function Classes(): JSX.Element {
  const counter = useSelector((state: RootState) => state.counter);

  console.log(counter);

  return (
    <Layout.Content style={{height:1500}}>
      Classes content
    </Layout.Content>
  );
}

export default Classes;
