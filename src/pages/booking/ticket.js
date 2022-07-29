import { useParams, useMatch, useNavigate } from "react-router-dom";
import { NavBar, Popup, Button, Space, Dialog } from "antd-mobile";

import style from "./ticket.module.css";
import { Page } from "..";
import { useStore } from "../../store";
import logoWhite from "../../images/logo-white.png";
import QRCode from "react-qr-code";
import { useEffect } from "react";

export function Ticket({
    show
}){
    const navigate = useNavigate();
    const ticketRouteMatch = useMatch("/bookings/:ticketId");
    const ticket = useStore(state => state.tickets.find(ticket => ticket._id === ticketRouteMatch?.params?.ticketId))
    useEffect(() => {
        useStore.getState().getUser();
        useStore.getState().getTickets();
    }, []);
    return <Popup visible={show} position="right" bodyClassName={style.container}>
        {ticket && <Page onBack={() => {
            navigate("/bookings");
        }}>
            <div className={style.content}>
                <Space direction="vertical" block>
                    <div className={style.countdown}>
                        <span className="txt-title" style={{ fontWeight: 400 }}>T-05:50:01</span>
                    </div>
                    <span>TICKETS</span>
                    <Space direction="vertical" block style={{ "--gap": "24px" }}>
                        {ticket.seats.map(seat => {
                            return <div className={style.ticket}>
                                <div className={style.background} />
                                <div>
                                    <span>TICKET</span>
                                    <span className="txt-title">{ticket.mission.title}</span>
                                    <span>SEAT <strong>A{seat}</strong></span>
                                </div>
                                <div>
                                    <img src={logoWhite} />
                                    <QRCode value={ticket._id} size={100} bgColor="var(--bg-color-3)" fgColor="#ffffff" />
                                </div>
                                <span className={style.ticketid}>{ticket._id}</span>
                            </div>
                        })}
                    </Space>
                    <span style={{ height: "50px" }} />
                    <span className="txt-title" style={{ fontWeight: 400 }}>PAID: <strong>${Intl.NumberFormat().format(ticket.amount)}</strong></span>
                    {ticket.deposit && <span className="txt-title" style={{ fontWeight: 400 }}>PENDING: <strong>${Intl.NumberFormat().format((ticket.mission.cost * ticket.seats.length) - ticket.amount)}</strong></span>}
                </Space>
            </div>
            <div className={style.action}>
                {ticket.deposit && <Button block color="primary" onClick={async () => {
                    await useStore.getState().updateTicket(ticket._id);
                    useStore.getState().getTickets();
                    Dialog.alert({
                        confirmText: "OK",
                        content: "Payment Successfull"
                    })
                }}>Make Full Payment</Button>}
                <Button block color="warning" onClick={() => {
                    if(!useStore.getState().currentUser.beneficiary){
                        Dialog.confirm({
                            content: "You need to add your bank account to receive money before requesting for refund",
                            cancelText: "Cancel",
                            confirmText: "Add Beneficiary",
                            onConfirm: async () => {
                                const uri = await useStore.getState().getBeneficiaryUrl(window.location.href);
                                window.location.href = uri;
                            }
                        });
                    }
                    else{
                        Dialog.confirm({
                            content: "Are you sure you want to cancel the ticket ?",
                            cancelText: "No",
                            confirmText: "Yes",
                            onConfirm: async () => {
                                await useStore.getState().cancelTicket(ticket._id);
                                useStore.getState().getTickets();
                                navigate("/bookings");
                            }
                        })
                    }
                }}>Cancel Ticket</Button>
            </div>
        </Page>}
    </Popup>
}