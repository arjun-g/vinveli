import { Button, Dialog, Space } from "antd-mobile";
import { useEffect } from "react";
import { useStore } from "../../store";
import style from "./booking.module.css";

export function Booking(){
    const tickets = useStore(state => state.tickets);
    const user = useStore(state => state.currentUser);
    useEffect(() => {
        useStore.getState().getTickets();
    }, []);
    return <div className={style.booking} direction="vertical" block>
        <span className="txt-title">MY BOOKINGS</span>
        <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
            {tickets.map(ticket => {
                return <div className={style.ticket}>
                    <span className={"txt-subtitle"}>{ticket.mission.title}</span>
                    <span className="txt-title">${ticket.amount}</span>
                    <div className={style.action}>
                        {ticket?.deposit && <Button size="mini" color="primary">Pay Remaining Amount</Button>}
                        <Button size="mini" onClick={() => {
                            Dialog.alert({
                                content: "Refund Successful",
                                confirmText: "OK"
                            });
                        }}>Initiate Refund</Button>
                    </div>
                </div>;
            })}
        </div>
    </div>
}