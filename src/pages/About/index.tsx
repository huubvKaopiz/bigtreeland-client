import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchUsers } from "../../store/counter/slice";
import { RootState, useAppDispatch } from "../../store/store";
import { get } from "lodash";
import { notification, Spin } from "antd";

export default function About(): JSX.Element {
  const dispatch = useAppDispatch();
  const users = useSelector((state: RootState) => state.counter.users);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchUsers({ search: "" }))
      .then((res) => {
        console.log(res);
        if (get(res, "error", null)) {
          notification.error({
            message: get(res, "error.message", "Có lỗi xảy ra"),
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  return (
    <>
      <Spin spinning={loading}>
        <h1>About</h1>
        {JSON.stringify(users)}
      </Spin>
    </>
  );
}
