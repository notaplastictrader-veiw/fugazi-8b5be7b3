import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
      <ShieldAlert className="w-16 h-16 text-destructive" />
      <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
      <p className="text-muted-foreground max-w-md">
        You don't have permission to access this section. Contact a super admin if you believe this is an error.
      </p>
      <Button variant="outline" onClick={() => navigate("/admin")}>
        Back to Dashboard
      </Button>
    </div>
  );
};

export default AccessDenied;
