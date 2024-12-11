import { CurrUserPosType } from "@/types/UserPositionType";

const PROXIMITY_THRESHOLD = 80;


export default function checkProximity(otherUsers: Array<{ id: string; position: { x: number; y: number } }>, currentUserPosition:CurrUserPosType) {
    let nearUser = null;

    for (const user of otherUsers) {
        const distance = Math.sqrt(
        Math.pow(user.position.x - currentUserPosition.x, 2) +
            Math.pow(user.position.y - currentUserPosition.y, 2)
        );

        if (distance < PROXIMITY_THRESHOLD) {
        nearUser = user.id;
        break;
        }
    }

    if (nearUser) {
        return nearUser; 
    } else {
        return null;
    }
};