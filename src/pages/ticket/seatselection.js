import { Button, Space, Stepper } from "antd-mobile";
import { useState } from "react";
import style from "./seatselection.module.css";

export function SeatSelection({
    bookedSeats = [4,5,6,7, 12, 14, 16, 20],
    onSeatsChanged
}){
    const seats = [1,2,3,4,5,6,1,2,3,4,5,6,1,2,3,4,5,6,1,2,3,4,5,6,1,2,3,4,5,6,];
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [maxSeats, setMaxSeats] = useState(1);
    return <div className={style.container}>
        <span className={`txt-subtitle`}>Select the seats</span>
        <div className={style.seatselectioncontainer}>
            <div className={style.seatselection}>
                {seats.map((seat, index) => {
                    return <div className={`${style.seat} ${bookedSeats.includes(index) ? style.booked : ""} ${selectedSeats.indexOf(index) >= 0 ? style.active : ""}`} style={{ transform: `rotate(${ (360 / seats.length) * (index + 1) }deg)` }} onClick={() => {
                        if(!bookedSeats.includes(index)){
                            if(selectedSeats.indexOf(index) >= 0){
                                setSelectedSeats(selectedSeats.filter(seat => seat !== index))
                            }
                            else{
                                if(selectedSeats.length < maxSeats){
                                    setSelectedSeats([...selectedSeats, index]);
                                }
                            }
                        }
                    }}>A{index}</div>
                })}
            </div>
        </div>
        <Space direction="vertical" block className={style.settings}>
            <div className={style.setting}>
                <span className="txt-medium">No of Seats</span>
                <span style={{ flex: "1 1 100%" }} />
                <div>
                    <Stepper min={1} max={10} value={maxSeats} onChange={value => {
                        if(value < selectedSeats.length){
                            setSelectedSeats(selectedSeats.slice(0, value));
                        }
                        setMaxSeats(value);
                    }} />
                </div>
            </div>
            <div className={style.setting}>
                <span className="txt-medium">Selected Seats</span>
                <span style={{ flex: " 1 1 100%" }} />
                <span>{selectedSeats.map(seat => `A${seat}`).join(", ")}</span>
            </div>
        </Space>
        <div className={style.action}>
            <Button color="primary" block disabled={selectedSeats.length !== maxSeats} onClick={() => {
                onSeatsChanged(selectedSeats);
            }}>Proceed</Button>
        </div>
    </div>
}