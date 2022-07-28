import { useEffect, useState } from "react";

export function useMissions(){
    const [missions, setMissions] = useState([]);

    useEffect(() => {
        fetch("/api/missions")
        .then(resp => resp.json())
        .then(data => setMissions(data.missions));
    }, []);

    return missions;
}

export function useMission(missionId){
    const [mission, setMission] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if(missionId){
            setLoading(true)
            fetch(`/api/missions/${missionId}`)
            .then(resp => resp.json())
            .then(data => {
                setLoading(false);
                setMission(data)
            });
        }
    }, [missionId]);

    return { mission, loading };
}