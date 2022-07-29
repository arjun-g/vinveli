import { Button, Dialog, Space } from "antd-mobile";
import { useEffect } from "react";
import { useNavigate, useMatch } from "react-router-dom";
import { useStore } from "../../store";
import style from "./booking.module.css";
import { Ticket } from "./ticket";

export function Booking(){
    const tickets = useStore(state => state.tickets);
    const ticketRouteMatch = useMatch("/bookings/:ticket");
    const user = useStore(state => state.currentUser);
    const navigate = useNavigate();
    useEffect(() => {
        useStore.getState().getTickets();
    }, []);
    return <><div className={style.booking} direction="vertical" block>
        <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
            {tickets.map(ticket => {
                return <div className={`${style.ticket} ${ticket.deposit ? style.pending : ""}`}>
                    <span className={"txt-subtitle"}>{ticket.mission.title}</span>
                    <span>LIFT OFF: 01/01/2023</span>
                    <span>RETURN: 01/01/2023</span>
                    <span>SEATS: {ticket.seats.map(s => `A${s}`).join(", ")}</span>
                    <div className={style.action}>
                        <div>
                            {!ticket.cancelled && ticket.deposit && <span style={{ color: "var(--secondary-color)" }}>* Payment Pending</span>}
                        </div>
                        <div>
                            {!ticket.cancelled && <Button size="mini" color="primary" onClick={() => {
                                navigate(`/bookings/${ticket._id}`);
                            }}>View Ticket</Button>}
                            {ticket.cancelled && <span style={{ color: "Var(--secondary-color)" }}>CANCELLED</span>}
                        </div>
                    </div>
                </div>;
            })}
        </div>
    </div>
    <Ticket show={ticketRouteMatch} />
    </>
}