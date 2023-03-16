import { ZoneInfo } from "../interfaces";

export const zone: ZoneInfo = {
    "meta": {
        "ground": {
            "texture": "sand_ground.jpg",
            "width": 5000,
            "height": 5000
        },
        "sky": {
            "texture": "sky_with_clouds.jpg"
        }
    },
    "objects": [
        {
            "type": "wall",
            "texture": "light_wall_stone.jpg",
            "x": -7.676987476496421,
            "y": 1,
            "scaleX": 180.44005094851673,
            "scaleY": 50,
            "name": "w1",
            "z": 52.179575303156696,
            "rotateX": 0,
            "rotateY": 1.5544703198566083,
            "rotateZ": 0,
            "scaleZ": 1
        },
        {
            "type": "wall",
            "texture": "light_wall_stone.jpg",
            "x": 140,
            "y": 1,
            "z": 150,
            "rotateY": 0.047973020219331246,
            "name": "w2",
            "scaleX": 300,
            "scaleY": 50,
            "rotateX": -3.141592653589793,
            "rotateZ": -3.141592653589793,
            "scaleZ": 1
        }
    ]
}