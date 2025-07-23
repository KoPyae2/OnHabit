"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { Copy, Check } from "lucide-react";

interface InvitePartnerModalProps {
  userId: Id<"users">;
  children: React.ReactNode;
}

export function InvitePartnerModal({ userId, children }: InvitePartnerModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"choice" | "create" | "join">("choice");
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createInviteCode = useMutation(api.couples.createInviteCode);
  const joinCouple = useMutation(api.couples.joinCouple);

  const handleCreateInvite = async () => {
    setLoading(true);
    try {
      const result = await createInviteCode({ userId });
      setInviteCode(result.inviteCode);
      setStep("create"); // Stay on create step to show the code
      toast.success("Invite code generated! Share it with your partner.");
    } catch (error) {
      console.error("Error creating invite:", error);
      toast.error("Failed to create invite code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode.trim() || joinCode.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit invite code");
      return;
    }

    setLoading(true);
    try {
      await joinCouple({ 
        userId, 
        inviteCode: joinCode.trim() 
      });
      toast.success("Successfully joined couple! 🤝");
      setOpen(false);
      setStep("choice");
      setJoinCode("");
      // Reload the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error("Error joining couple:", error);
      toast.error("Invalid invite code or couple is full. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success("Invite code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy invite code");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("choice");
      setInviteCode("");
      setJoinCode("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-blue-600">🤝</span>
            Connect with Partner
          </DialogTitle>
          <DialogDescription>
            {step === "choice" && "Choose how you want to connect with your partner"}
            {step === "create" && "Share this code with your partner to connect"}
            {step === "join" && "Enter your partner's invite code to join"}
          </DialogDescription>
        </DialogHeader>

        {step === "choice" && (
          <div className="space-y-4">
            <Button
              onClick={() => setStep("create")}
              className="w-full h-16 text-left justify-start"
              variant="outline"
            >
              <div className="text-left">
                <div className="font-medium">Create Invite Code</div>
                <div className="text-sm text-gray-500">Generate a code for your partner to join</div>
              </div>
            </Button>
            
            <Button
              onClick={() => setStep("join")}
              className="w-full h-16 text-left justify-start"
              variant="outline"
            >
              <div className="text-left">
                <div className="font-medium">Join with Code</div>
                <div className="text-sm text-gray-500">Enter a code your partner shared with you</div>
              </div>
            </Button>

            <Button onClick={handleClose} variant="ghost" className="w-full">
              Cancel
            </Button>
          </div>
        )}

        {step === "create" && (
          <div className="space-y-4">
            {!inviteCode ? (
              <>
                <p className="text-sm text-gray-600">
                  Click below to generate a unique 6-digit code that your partner can use to connect with you.
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setStep("choice")}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateInvite}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Generating..." : "Generate Code"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">Share this code with your partner:</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 text-center">
                      <div className="text-3xl font-mono font-bold text-blue-600 bg-blue-50 py-4 px-6 rounded-lg">
                        {inviteCode}
                      </div>
                    </div>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="p-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Your partner can use this code to join and start tracking habits together.
                  </p>
                </div>
                <Button onClick={handleClose} className="w-full">
                  Done
                </Button>
              </>
            )}
          </div>
        )}

        {step === "join" && (
          <form onSubmit={handleJoinCouple} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="joinCode">Partner's Invite Code</Label>
              <Input
                id="joinCode"
                placeholder="Enter 6-digit code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                maxLength={6}
                disabled={loading}
                className="text-center text-lg font-mono"
              />
              <p className="text-xs text-gray-500">
                Ask your partner to share their invite code with you.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={() => setStep("choice")}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading || joinCode.length !== 6}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Joining..." : "Join Partner"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
