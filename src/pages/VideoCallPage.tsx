/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import io from "socket.io-client";
//import { types as mediasoupClient } from "mediasoup-client";

const VideoCallPage: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  // const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const socket = io("http://localhost:8080");
  console.log("reached here");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Client connected, socket ID: " + socket.id);
    });

    socket.on("connection-success", ({ socketId }: any) => {
      console.log("Received socket ID: " + socketId);
    });

    socket.on("connect_error", (err: any) => {
      console.error("Connection error details:", err);
      console.error("Error stack:", err.stack);
    });

    socket.on("error", (err: any) => {
      console.error("Socket error:", err);
    });

    socket.on("hello", (msg: any) => {
      console.log(msg);
    });
    socket.on("new-user", (msg: any) => {
      console.log(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  console.log("reached here1");

  // let device: mediasoupClient.Device;
  // let rtpCapabilities: any;
  // let producerTransport: mediasoupClient.Transport;
  // let consumerTransport: mediasoupClient.Transport;
  // let producer: mediasoupClient.Producer;
  // let consumer: mediasoupClient.Consumer;

  let params: {
    track?: MediaStreamTrack;
    encodings: { rid: string; maxBitrate: number; scalabilityMode: string }[];
    codecOptions: { videoGoogleStartBitrate: number };
  } = {
    encodings: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" },
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" },
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" },
    ],
    codecOptions: {
      videoGoogleStartBitrate: 1000,
    },
  };

  const streamSuccess = async (stream: MediaStream) => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    const track = stream.getVideoTracks()[0];
    params = { track, ...params };
  };

  const getLocalStream = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          width: { min: 640, max: 1920 },
          height: { min: 400, max: 1080 },
        },
      })
      .then(streamSuccess)
      .catch((error) => console.log(error.message));
  };

  // const createDevice = async () => {
  //   try {
  //     device = new mediasoupClient.Device();
  //     await device.load({ routerRtpCapabilities: rtpCapabilities });
  //     console.log("RTP Capabilities", device.rtpCapabilities);
  //   } catch (error) {
  //     console.error(error);
  //     if ((error as any).name === "UnsupportedError") {
  //       console.warn("Browser not supported");
  //     }
  //   }
  // };

  // const getRtpCapabilities = () => {
  //   socket.emit("getRtpCapabilities", (data: any) => {
  //     console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`);
  //     rtpCapabilities = data.rtpCapabilities;
  //   });
  // };

  // const createSendTransport = () => {
  //   socket.emit(
  //     "createWebRtcTransport",
  //     { sender: true },
  //     ({ params }: any) => {
  //       if (params.error) {
  //         console.error(params.error);
  //         return;
  //       }

  //       producerTransport = device.createSendTransport(params);

  //       producerTransport.on(
  //         "connect",
  //         async ({ dtlsParameters }, callback, errback) => {
  //           try {
  //             await socket.emit("transport-connect", { dtlsParameters });
  //             callback();
  //           } catch (error: any) {
  //             errback(error);
  //           }
  //         }
  //       );

  //       producerTransport.on(
  //         "produce",
  //         async (parameters, callback, errback) => {
  //           try {
  //             await socket.emit(
  //               "transport-produce",
  //               {
  //                 kind: parameters.kind,
  //                 rtpParameters: parameters.rtpParameters,
  //                 appData: parameters.appData,
  //               },
  //               ({ id }: any) => callback({ id })
  //             );
  //           } catch (error: any) {
  //             errback(error);
  //           }
  //         }
  //       );
  //     }
  //   );
  // };

  // const connectSendTransport = async () => {
  //   producer = await producerTransport.produce(params);

  //   producer.on("trackended", () => {
  //     console.log("track ended");
  //   });

  //   producer.on("transportclose", () => {
  //     console.log("transport ended");
  //   });
  // };

  // const createRecvTransport = async () => {
  //   socket.emit(
  //     "createWebRtcTransport",
  //     { sender: false },
  //     ({ params }: any) => {
  //       if (params.error) {
  //         console.error(params.error);
  //         return;
  //       }

  //       consumerTransport = device.createRecvTransport(params);

  //       consumerTransport.on(
  //         "connect",
  //         async ({ dtlsParameters }, callback, errback) => {
  //           try {
  //             await socket.emit("transport-recv-connect", { dtlsParameters });
  //             callback();
  //           } catch (error: any) {
  //             errback(error);
  //           }
  //         }
  //       );
  //     }
  //   );
  // };

  // const connectRecvTransport = async () => {
  //   socket.emit(
  //     "consume",
  //     { rtpCapabilities: device.rtpCapabilities },
  //     async ({ params }: any) => {
  //       if (params.error) {
  //         console.error("Cannot Consume");
  //         return;
  //       }

  //       consumer = await consumerTransport.consume({
  //         id: params.id,
  //         producerId: params.producerId,
  //         kind: params.kind,
  //         rtpParameters: params.rtpParameters,
  //       });

  //       const { track } = consumer;
  //       if (remoteVideoRef.current) {
  //         remoteVideoRef.current.srcObject = new MediaStream([track]);
  //       }

  //       socket.emit("consumer-resume");
  //     }
  //   );
  // };

  return (
    // <div className="flex flex-col items-center p-4 space-y-4">
    //   <div className="grid grid-cols-2 gap-4">
    //     <div className="bg-black">
    //       <video ref={localVideoRef} autoPlay className="w-96"></video>
    //     </div>
    //     <div className="bg-black">
    //       <video ref={remoteVideoRef} autoPlay className="w-96"></video>
    //     </div>
    //   </div>
    //   <button
    //     onClick={getLocalStream}
    //     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    //   >
    //     Get Local Video
    //   </button>
    //   <button
    //     onClick={getRtpCapabilities}
    //     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    //   >
    //     Get RTP Capabilities
    //   </button>
    //   <button
    //     onClick={createDevice}
    //     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    //   >
    //     Create Device
    //   </button>
    //   <button
    //     onClick={createSendTransport}
    //     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    //   >
    //     Create Send Transport
    //   </button>
    //   <button
    //     onClick={connectSendTransport}
    //     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    //   >
    //     Connect Send Transport & Produce
    //   </button>
    //   <button
    //     onClick={createRecvTransport}
    //     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    //   >
    //     Create Recv Transport
    //   </button>
    //   <button
    //     onClick={connectRecvTransport}
    //     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    //   >
    //     Connect Recv Transport & Consume
    //   </button>
    // </div>
    <div>
      <Button onClick={getLocalStream}>start your video</Button>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black">
          <video ref={localVideoRef} autoPlay className="w-96"></video>{" "}
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;
