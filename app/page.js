"use client";

import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button, Checkbox, Form, Input, Modal } from "antd";
import { auth, db } from "../firebase";
import { CloseOutlined } from "@ant-design/icons";
import { doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";

export default function Home() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(true);

  const onFinish = async (values) => {
    const { email, password } = values;

    setLoading(true);

    form
      .validateFields()
      .then(() => {
        signInWithEmailAndPassword(auth, email, password)
          .then(async (res) => {
            if (res?.user?.emailVerified === true) {
              const userRef = doc(db, "Emails_WebApp", res?.user?.uid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userData = {
                  uid: res?.user?.uid,
                  emailVerified: res?.user?.emailVerified,
                  ...userSnap.data(),
                };
                Cookies.set("userID", res?.user?.uid);
                switch (userData?.role) {
                  case "USER":
                    router.push("/landing-page");
                    break;
                  case "AMBASSADOR":
                    router.push("/events");
                    break;
                }
              } else {
                console.log("No such user!");
              }
            } else {
              Modal.error({
                title: "Please verify your email first",
                content: "Please check your email and verify your account.",
                okText: "Close",
                closeIcon: <CloseOutlined />,
                onOk: () => {},
                className: "custom-success-modal",
              });
              router.push("/login");
            }
          })
          .catch((err) => {
            if (err.code === "auth/invalid-login-credentials") {
              form.setFields([
                {
                  name: "password",
                  errors: ["Incorrect email or password please try again"],
                },
              ]);
            } else {
              form.setFields([
                {
                  name: "email",
                  errors: [err?.code],
                },
              ]);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch((errorInfo) => {
        console.log("Validation failed:", errorInfo);
        setLoading(false);
      });
  };

  useEffect(() => {
    setPage(false);
  }, []);

  if (page) return "";

  return (
    <div className="mx-auto max-w-[460px] mt-[50px] pl-[10px] pr-[10px]  items-center flex flex-col leading-[70px]">
      <h1 className="font-[600] text-[30px] font-poppins text-[#000] mb-[-30px]">
        Sign-in
      </h1>
      <p className="font-[500] text-[14px] font-poppins text-[#8591A3]  mb-[45px]"></p>

      <Form form={form} onFinish={onFinish} className="max-w-[450px] w-full">
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Please enter your email!",
            },
            {
              type: "email",
              message: "Please enter a valid email address!",
            },
          ]}
        >
          <Input
            autoComplete="email"
            placeholder="Email"
            className="font-[500] text-[14px] rounded-[10px] font-poppins text-[#8591A3] h-[60px] max-w-[450px]"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Please enter your password!",
            },
          ]}
        >
          <Input.Password
            autoComplete="current-password"
            placeholder="Password"
            className="h-[60px] max-w-[450px] rounded-[10px]"
            maxLength={16}
          />
        </Form.Item>

        <div className="flex justify-between">
          <Form.Item name="remember" valuePropName="checked">
            <Checkbox className="mr-[5px] cursor-pointer items-center flex text-blue-500  font-poppins text-[16px] font-[500]">
              Remember me
            </Checkbox>
          </Form.Item>
          <p
            onClick={() => {
              router.push("/forgot-password");
            }}
            className="text-blue-500  font-poppins text-[16px] font-[500] cursor-pointer"
          >
            Forgot password?
          </p>
        </div>
        <Form.Item>
          <Button
            htmlType="submit"
            loading={loading}
            className="rounded-[10px] bg-[#165188] max-w-[450px] w-full h-[50px]  login text-white text-[18px] font-[500]  font-poppins"
          >
            Sign in
          </Button>
        </Form.Item>
      </Form>

      <Button
        onClick={() => {
          router.push("/signup");
        }}
        className="rounded-[10px] bg-[#165188] max-w-[450px] w-full h-[50px]  login text-white text-[18px] font-[500]  font-poppins"
      >
        Sign up
      </Button>
    </div>
  );
}
