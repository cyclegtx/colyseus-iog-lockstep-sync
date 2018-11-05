import { Room, Client } from "colyseus";

export class IOGLockStepSyncRoom extends Room {
    seed:number = 0;

    const FRAME_RATE:number = 20;
    frame_index:number = 0;
    frame_interval:number = null;
    frame_list:array = [[]];
    frame_acc:number = 3;

    actors:Map<string,any> = new Map();

    maxClients = 20;
    // Authorize client based on provided options before WebSocket handshake is complete
    // onAuth (options: any) {
    //     return true;
    // }

    // When room is initialized
    onInit (options: any) { 
        this.frame_index = 0;
        this.seed = Math.round(Math.random()*1000000000);
        this.frame_interval = setInterval(this.tick.bind(this),1000/this.FRAME_RATE);
        this.frame_list = [];
    }

    getFrameByIndex(index){
        if(this.frame_list[index] === undefined){
            this.frame_list[index] = [];
        }
        return this.frame_list[index];
    }

    //
    tick(){
        let frames = [];
        frames.push([this.frame_index,this.getFrameByIndex(this.frame_index)]);
        this.broadcast(["f",frames]);
        this.frame_index += this.frame_acc;
    }

    // Checks if a new client is allowed to join. (default: `return true`)
    requestJoin (options: any, isNew: boolean) {
        return true;
    }


    // When client successfully join the room
    onJoin (client: Client) {
        this.broadcast(`${ client.sessionId } joined.`);
    }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) { 
        this.broadcast(`${ client.sessionId } left.`);
    }

    // When a client sends a message
    onMessage (client: Client, message: any) {
        switch(message[0]){
            case "cmd":
                this.onCmd(client,message);
                break;
            case "fs":
                this.onGetAllFrames(client,message);
                break;
            default:
                console.log("接收到未处理的message:")
                console.log(message)
                break;
        }

        // console.log(message)
        // console.log("BasicRoom received message from", client.sessionId, ":", message);
        // this.broadcast(`(${ client.sessionId }) ${ message }`);
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {
        clearInterval(this.frame_interval);
        console.log("Dispose IOGRoom");
    }


    //当收到用户的输入，存入frame_list
    onCmd(client:Client,message:any){
        if(message[0] == "cmd" && message[1][0] == "addplayer"){
            // console.log(message)
        }
        this.frame_list_push([client.sessionId,message[1]]);
    }

    onGetAllFrames(client:Client,message:any){
        let frames = [];
        for(let i=0,len=this.frame_list.length;i<len;i++){
            if(this.frame_list[i] !== undefined){
                frames.push([i,this.frame_list[i]]);
            }
        }
        if(frames.length == 0){
            frames = [[0,[]]];
        }
        this.send(client,["fs",frames])
    }

    frame_list_push(data:any){
        if(this.frame_list[this.frame_index] == undefined){
            this.frame_list[this.frame_index] = [];
        }
        this.frame_list[this.frame_index].push(data);
    }
        
}