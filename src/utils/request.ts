import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export default function request(
  options: AxiosRequestConfig
): Promise<AxiosResponse> {
  return axios(options);
}
