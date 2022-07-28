
import style from "./auth.module.css";
import logoWhite from "../../images/logo-white.png"
import { useEffect, useRef, useState } from "react";
import { useNavigate, useMatch } from "react-router-dom";
import { Icon } from "../../components/icons";
import { classNames } from "../../utils";
import { Button, Space, Form, Input, Dialog } from "antd-mobile";
import { PlanetBackground } from "../../components/planet";
import { useStore } from "../../store";

export function Auth(){
    const match = useMatch("/auth/:option");
    const alertShown = useRef(false);
    const showTitlebar = !!match?.params?.option;
    const navigate = useNavigate();
    useEffect(() => {
        if(!alertShown.current){
            alertShown.current = true;
            Dialog.alert({
                content: "This is just a demo application. Do not give you personal information anywhere. Use a dummy email address and password to register/login.",
                confirmText: "OK"
            });
        }
    }, []);
    return <div className={style.auth}>
        <div className={classNames({
            [style.title]: true,
            [style.small]: showTitlebar
        })}>
            <div className={style.logo}>
                <img src={logoWhite} />
                <span className={classNames([`txt-subtitle`, style.tagline])}>TO SPACE AND BEYOND</span>
            </div>
            <button className={style.back} onClick={() => {
                navigate(-1)
            }}>
                <Icon icon="arrow_back_ios" />
            </button>
        </div>
        <div className={classNames({
            [style.overlay]: true,
            [style.show]: showTitlebar
        })} />
        <div className={classNames({
            [style.options]: true,
            [style.hide]: showTitlebar
        })}>
            <Space direction="vertical" block style={{ "--gap": "18px" }}>
                <Button color="primary" block={true} onClick={() => {
                    navigate("/auth/signup");
                }}>Sign Up</Button>
                <Button color="default" block={true} onClick={() => {
                    navigate("/auth/login");
                }}>Login</Button>
            </Space>
        </div>
        <div className={classNames({
            [style.signup]: true,
            [style.hide]: match?.params?.option !== "login"
        })}>
            <h1 className="txt-title">Login</h1>
            <Form className={style.signupform} onFinish={(e) => {
                useStore.getState().login({
                    email: e.email,
                    password: e.password
                })
                .then(resp => navigate("/"))
                .catch(err => {
                    Dialog.alert({
                        content: "Invalid Credentials",
                        confirmText: "OK"
                    });
                });
            }} footer={<Button color="primary" block={true} type="submit">Login</Button>}>
                <Form.Item label="EMAIL" name="email" rules={[{ required: true, message: "Email Required" }]}>
                    <Input type={"email"} autoComplete={"login_email"} />
                </Form.Item>
                <Form.Item label="PASSWORD" name="password" rules={[{ required: true, message: "Password Required" }]}>
                    <Input type={"password"} autoComplete={"login_password"} />
                </Form.Item>
            </Form>
        </div>
        <div className={classNames({
            [style.signup]: true,
            [style.hide]: match?.params?.option !== "signup"
        })}>
            <h1 className="txt-title">SIGN UP</h1>
            <Form className={style.signupform} onFinish={(e) => {
                useStore.getState().signup({
                    email: e.email,
                    password: e.password
                })
                .then(resp => navigate("/"))
                .catch(err => {
                    Dialog.alert({
                        content: "Email Invalid or Already Taken",
                        confirmText: "OK"
                    });
                });
            }} footer={<Button color="primary" block={true} type="submit">Sign Up</Button>}>
                <Form.Item label="EMAIL" name="email" rules={[{ required: true, message: "Email Required" }]}>
                    <Input type={"email"} autoComplete={"register_email"} />
                </Form.Item>
                <Form.Item label="PASSWORD" name="password" rules={[{ required: true, message: "Password Required" }]}>
                    <Input type={"password"} autoComplete={"regsiter_password"} />
                </Form.Item>
            </Form>
        </div>
    </div>
}