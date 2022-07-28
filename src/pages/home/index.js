import { Popup, Space, TabBar, Swiper } from "antd-mobile";
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useMatch } from "react-router-dom";
import { Page } from "../";
import { Icon } from "../../components/icons";
import { PlanetBackground } from "../../components/planet";
import { useStore } from "../../store";
import { useMissions } from "../../hooks";
import { Mission } from "../mission";

import style from "./home.module.css";

import earthBG from "../../images/earth_only_bg.png";
import moonBG from "../../images/moon_only_bg.png";
import marsBG from "../../images/mars_only_bg.png";
import shuttleBG from "../../images/shuttle_bg_only.png";
import issBG from "../../images/iss_bg_only.png";
import { Booking } from "../booking";

const backgrounds = {
    "earth": earthBG,
    "moon": moonBG,
    "mars": marsBG,
    "shuttle": shuttleBG,
    "iss": issBG
};

export function Home(){
    const missions = useStore(state => state.missions);
    const swipperRef = useRef(null);
    const missionRouteMatch = useMatch("/mission/:missionId/*");
    const bookingsRouteMatch = useMatch("/bookings");

    useEffect(() => {
        useStore.getState().getMissions();
    }, [true]);

    return <Page showBack={false}>
        <div className={style.home}>
            <div className={style.content}>
                <Swiper defaultIndex={bookingsRouteMatch ? 1 : 0} ref={swipperRef}>
                    <Swiper.Item>
                        <Space direction="vertical">
                            <span className="txt-small">Welcome</span>
                            <h2 className="txt-heading">Let's start planning your tour</h2>
                            <Space className={style.missions} direction={"vertical"}>
                                {missions.map(mission => {
                                    return <Link to={`/mission/${mission._id}`} className={style.mission} style={{ backgroundImage: `url('${backgrounds[mission.bg]}')` }}>
                                        <Space direction="vertical" className={style.details}>
                                            <span>{mission.type}</span>
                                            <span className="txt-title">{mission.title}</span>
                                            <span>{mission.tagline}</span>
                                        </Space>
                                        <Icon icon={"chevron_right"} className={style.rightarrow} />
                                    </Link>
                                })}
                            </Space>
                        </Space>
                    </Swiper.Item>
                    <Swiper.Item>
                        <Booking />
                    </Swiper.Item>
                </Swiper>
            </div>
            <TabBar className={style.bottom} defaultActiveKey={bookingsRouteMatch ? "bookings" : "home"} onChange={(key) => {
                if(key === "home"){
                    swipperRef.current.swipeTo(0);
                }
                else if(key === "bookings"){
                    swipperRef.current.swipeTo(1);
                }
            }}>
                <TabBar.Item key="home" icon={<Icon icon={"home"} className={style.tabicon} />} title="Home" />
                <TabBar.Item key="bookings" icon={<Icon icon={"person"} className={style.tabicon} />} title="Bookings" />
            </TabBar>
        </div>
        <Mission missionId={missionRouteMatch?.params?.missionId} />
    </Page>
}