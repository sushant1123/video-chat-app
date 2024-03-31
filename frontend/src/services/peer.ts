class PeerService {
  peer: any;

  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"],
          },
        ],
      });
    }
  }

  async getAnswer(offer: any) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(answer));

      return answer;
    }
  }

  async setLocalDescription(answer: any) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async getOffer() {
    if (this?.peer) {
      const offer = await this?.peer?.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));

      return offer;
    }
  }
}

export const peerService = new PeerService();
