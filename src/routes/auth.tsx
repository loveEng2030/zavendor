import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) toast.error(error.message || "خطأ في تسجيل الدخول");
    else {
      toast.success("أهلاً بك!");
      navigate({ to: search.redirect || "/" });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("كلمة المرور يجب 6 أحرف على الأقل");
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) toast.error(error.message || "تعذر إنشاء الحساب");
    else {
      toast.success("تم إنشاء الحساب بنجاح!");
      navigate({ to: search.redirect || "/" });
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("تعذر تسجيل الدخول بجوجل");
      return;
    }
    if (result.redirected) return;
    setLoading(false);
    toast.success("أهلاً بك!");
    navigate({ to: search.redirect || "/" });
  };

  const googleBlock = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full gap-2"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        المتابعة بحساب Google
      </Button>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <span className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">أو</span>
        </span>
      </div>
    </>
  );

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-6">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-bold text-foreground">حسابك في ZaVendor</h1>
          <p className="mt-1 text-sm text-muted-foreground">سجل دخول أو أنشئ حساباً جديداً</p>
        </div>
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">دخول</TabsTrigger>
            <TabsTrigger value="signup">حساب جديد</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            {googleBlock}
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
              </div>
              <div>
                <Label>كلمة المرور</Label>
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "..." : "تسجيل الدخول"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            {googleBlock}
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <Label>الاسم بالكامل</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
              </div>
              <div>
                <Label>كلمة المرور</Label>
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "..." : "إنشاء حساب"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
