import { useNavigate, useMatch } from "react-router-dom";
import { Button, NavBar, Popup, Space } from "antd-mobile";
import { PlanetBackground } from "../../components/planet";
import { MISSIONS } from "../home";
import style from "./mission.module.css";
import { useEffect, useState } from "react";
import { classNames } from "../../utils";
import { useMission } from "../../hooks";
import { Ticket } from "../ticket";
import { useStore } from "../../store";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

function totalDuration(obj){
    console.log("TOTAL",obj, dayjs.duration({
        days: obj.days,
        hours: obj.hours,
        months: obj.months
    }).asSeconds())
    return dayjs.duration({
        days: obj.days,
        hours: obj.hours,
        months: obj.months
    })
}

export function Mission({
    missionId
}){
    const [showDetails, setShowDetails] = useState(false);
    // const [startBooking, setStartBooking] = useState(false);
    const showBooking = useMatch("/mission/:missionId/ticket");
    const navigate = useNavigate();
    const mission = useStore(state => state.missions.find(mission => mission._id === missionId));

    useEffect(() => {
        // setShowDetails(false);
    }, [missionId]);

    return <Popup visible={!!missionId} bodyClassName={style.body}>
        {mission && <><PlanetBackground planet={mission.bg} className={classNames({
            [style.background]: true,
            [style.small]: showDetails
        })} />
        <div className={style.content}>
            <NavBar onBack={() => {
                navigate(-1);
            }} left={mission.type} />
            <div className={style.intro}>
                <span className={classNames({
                    "txt-title": showDetails,
                    "txt-mega": !showDetails
                })}>{mission.title}</span>
            </div>
            <div className={classNames({
                [style.details]: true,
                [style.show]: showDetails
            })}>
                <Space direction="vertical">
                    <div className={style.itenary}>
                        <div className={style.doublecolumn}>
                            <Space direction="vertical" block>
                                <span>LIFTOFF</span>
                                <span>10 MAY 2023</span>

                                <span className="txt-title">{mission.from}</span>
                                <span>10 MAY 2023</span>

                                {totalDuration(mission.halt).asSeconds() > 0 && <><span className="txt-title">{mission.to}</span>
                                <span>10 MAY 2023</span></>}

                                <div className={style.spacer} />

                                <span>SEATS <strong>60</strong></span>
                                <span>SEATS </span>
                            </Space>
                            <Space direction="vertical" block align="end">
                                <span>RETURN</span>
                                <span>10 MAY 2023</span>

                                <span className="txt-title">{mission.to}</span>
                                <span>10 MAY 2023</span>

                                {totalDuration(mission.halt).asSeconds() > 0 && <><span className="txt-title">{mission.from}</span>
                                <span>10 MAY 2023</span></>}

                                <div className={style.spacer} />

                                <span><strong>${Intl.NumberFormat().format(mission.cost)}</strong></span>
                                <span>PER PERSON</span>
                            </Space>
                        </div>
                    </div>
                    <div className={style.detail}>
                        <span>ABOUT</span>
                        <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                    </div>
                    <div className={style.item}>
                        <span>Tour Duration</span>
                        <span />
                        <span>10 Days</span>
                    </div>
                    <div className={style.item}>
                        <span>Halt</span>
                        <span />
                        <span>10 Days</span>
                    </div>
                </Space>
            </div>
            <div className={style.bottom}>
                {!showDetails && <Space direction="vertical" style={{width: "100%"}}>
                    <p>
                        {mission.tagline}<br />
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <Button block={true} color="primary" onClick={() => {
                        setShowDetails(true);
                    }}>EXPLORE</Button>
                </Space>}
                {showDetails && <div>
                    <Button block={true} color="primary" onClick={() => {
                        navigate(`/mission/${missionId}/ticket`);
                    }}>BUY TICKET</Button>
                </div>}
            </div>
        </div>
        <Ticket show={showBooking} mission={mission} tickets={1} />
        </>}
    </Popup>
}