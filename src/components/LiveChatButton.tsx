import { MessageCircle } from "lucide-react";

const LiveChatButton = () => {
  return (
    <a
      href="https://t.me/notaplastictrader"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-5 z-[180] w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform"
      title="Chat with us on Telegram"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
};

export default LiveChatButton;
