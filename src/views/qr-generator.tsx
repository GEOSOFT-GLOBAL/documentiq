import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Download,
  RotateCcw,
  QrCode,
  Link,
  Mail,
  Phone,
  Wifi,
  MessageSquare,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

type QRType = "text" | "url" | "email" | "phone" | "wifi" | "sms";

interface WifiData {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

const QRGenerator = () => {
  const [activeTab, setActiveTab] = useState<QRType>("text");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [emailInput, setEmailInput] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [phoneInput, setPhoneInput] = useState("");
  const [smsInput, setSmsInput] = useState({ phone: "", message: "" });
  const [wifiInput, setWifiInput] = useState<WifiData>({
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
  });

  // QR Code options
  const [size, setSize] = useState([256]);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR data string based on type
  const getQRData = (): string => {
    switch (activeTab) {
      case "text":
        return textInput;
      case "url":
        return urlInput.startsWith("http") ? urlInput : `https://${urlInput}`;
      case "email": {
        const emailParams = new URLSearchParams();
        if (emailInput.subject) emailParams.set("subject", emailInput.subject);
        if (emailInput.body) emailParams.set("body", emailInput.body);
        const emailQuery = emailParams.toString();
        return `mailto:${emailInput.to}${emailQuery ? `?${emailQuery}` : ""}`;
      }
      case "phone":
        return `tel:${phoneInput}`;
      case "sms":
        return `sms:${smsInput.phone}${
          smsInput.message
            ? `?body=${encodeURIComponent(smsInput.message)}`
            : ""
        }`;
      case "wifi":
        return `WIFI:T:${wifiInput.encryption};S:${wifiInput.ssid};P:${wifiInput.password};H:${wifiInput.hidden};;`;
      default:
        return "";
    }
  };

  // Auto-generate QR on input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const generateQRCode = async () => {
        let data = "";
        switch (activeTab) {
          case "text":
            data = textInput;
            break;
          case "url":
            data = urlInput.startsWith("http")
              ? urlInput
              : `https://${urlInput}`;
            break;
          case "email": {
            const emailParams = new URLSearchParams();
            if (emailInput.subject)
              emailParams.set("subject", emailInput.subject);
            if (emailInput.body) emailParams.set("body", emailInput.body);
            const emailQuery = emailParams.toString();
            data = `mailto:${emailInput.to}${
              emailQuery ? `?${emailQuery}` : ""
            }`;
            break;
          }
          case "phone":
            data = `tel:${phoneInput}`;
            break;
          case "sms":
            data = `sms:${smsInput.phone}${
              smsInput.message
                ? `?body=${encodeURIComponent(smsInput.message)}`
                : ""
            }`;
            break;
          case "wifi":
            data = `WIFI:T:${wifiInput.encryption};S:${wifiInput.ssid};P:${wifiInput.password};H:${wifiInput.hidden};;`;
            break;
        }

        if (
          !data.trim() ||
          data === "mailto:" ||
          data === "tel:" ||
          data === "sms:" ||
          data === "https://"
        ) {
          setQrDataUrl(null);
          return;
        }

        try {
          const dataUrl = await QRCode.toDataURL(data, {
            width: size[0],
            margin: 2,
            color: { dark: fgColor, light: bgColor },
            errorCorrectionLevel: errorLevel,
          });
          setQrDataUrl(dataUrl);
        } catch (err) {
          console.error("QR generation error:", err);
        }
      };

      generateQRCode();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    textInput,
    urlInput,
    emailInput,
    phoneInput,
    smsInput,
    wifiInput,
    size,
    fgColor,
    bgColor,
    errorLevel,
    activeTab,
  ]);

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `qrcode-${activeTab}.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success("Downloaded as PNG!");
  };

  const handleDownloadSVG = async () => {
    const data = getQRData();
    if (!data.trim()) return;

    try {
      const svgString = await QRCode.toString(data, {
        type: "svg",
        width: size[0],
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorLevel,
      });

      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `qrcode-${activeTab}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded as SVG!");
    } catch {
      toast.error("Failed to download SVG");
    }
  };

  const handleCopyToClipboard = async () => {
    if (!qrDataUrl) return;

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleReset = () => {
    setTextInput("");
    setUrlInput("");
    setEmailInput({ to: "", subject: "", body: "" });
    setPhoneInput("");
    setSmsInput({ phone: "", message: "" });
    setWifiInput({ ssid: "", password: "", encryption: "WPA", hidden: false });
    setQrDataUrl(null);
    toast.info("Reset complete");
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-x-hidden">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">QR Code Generator</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Generate QR codes for text, URLs, emails, phone numbers, WiFi, and
          more
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1 overflow-hidden">
        {/* Left Panel - Input */}
        <div className="space-y-3 md:space-y-4 overflow-auto">
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">Content Type</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Select what type of QR code to generate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as QRType)}
              >
                <TabsList className="grid grid-cols-3 mb-2 md:mb-4">
                  <TabsTrigger value="text" className="text-xs md:text-sm">
                    <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="hidden sm:inline">Text</span>
                  </TabsTrigger>
                  <TabsTrigger value="url" className="text-xs md:text-sm">
                    <Link className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="hidden sm:inline">URL</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="text-xs md:text-sm">
                    <Mail className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="hidden sm:inline">Email</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="phone" className="text-xs md:text-sm">
                    <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="hidden sm:inline">Phone</span>
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="text-xs md:text-sm">
                    <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="hidden sm:inline">SMS</span>
                  </TabsTrigger>
                  <TabsTrigger value="wifi" className="text-xs md:text-sm">
                    <Wifi className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="hidden sm:inline">WiFi</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-3 md:mt-4">
                  <Textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter any text..."
                    className="min-h-[100px] md:min-h-[120px] text-sm"
                  />
                </TabsContent>

                <TabsContent value="url" className="mt-3 md:mt-4">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                  />
                </TabsContent>

                <TabsContent value="email" className="mt-3 md:mt-4 space-y-2 md:space-y-3">
                  <Input
                    value={emailInput.to}
                    onChange={(e) =>
                      setEmailInput({ ...emailInput, to: e.target.value })
                    }
                    placeholder="recipient@example.com"
                  />
                  <Input
                    value={emailInput.subject}
                    onChange={(e) =>
                      setEmailInput({ ...emailInput, subject: e.target.value })
                    }
                    placeholder="Subject (optional)"
                  />
                  <Textarea
                    value={emailInput.body}
                    onChange={(e) =>
                      setEmailInput({ ...emailInput, body: e.target.value })
                    }
                    placeholder="Message body (optional)"
                    className="min-h-[60px] md:min-h-[80px] text-sm"
                  />
                </TabsContent>

                <TabsContent value="phone" className="mt-3 md:mt-4">
                  <Input
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+1234567890"
                  />
                </TabsContent>

                <TabsContent value="sms" className="mt-3 md:mt-4 space-y-2 md:space-y-3">
                  <Input
                    value={smsInput.phone}
                    onChange={(e) =>
                      setSmsInput({ ...smsInput, phone: e.target.value })
                    }
                    placeholder="+1234567890"
                  />
                  <Textarea
                    value={smsInput.message}
                    onChange={(e) =>
                      setSmsInput({ ...smsInput, message: e.target.value })
                    }
                    placeholder="Message (optional)"
                    className="min-h-[60px] md:min-h-[80px] text-sm"
                  />
                </TabsContent>

                <TabsContent value="wifi" className="mt-3 md:mt-4 space-y-2 md:space-y-3">
                  <Input
                    value={wifiInput.ssid}
                    onChange={(e) =>
                      setWifiInput({ ...wifiInput, ssid: e.target.value })
                    }
                    placeholder="Network name (SSID)"
                  />
                  <Input
                    type="password"
                    value={wifiInput.password}
                    onChange={(e) =>
                      setWifiInput({ ...wifiInput, password: e.target.value })
                    }
                    placeholder="Password"
                  />
                  <Select
                    value={wifiInput.encryption}
                    onValueChange={(v) =>
                      setWifiInput({
                        ...wifiInput,
                        encryption: v as WifiData["encryption"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="nopass">No Password</SelectItem>
                    </SelectContent>
                  </Select>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">Customization</CardTitle>
              <CardDescription className="text-xs md:text-sm">Adjust size and colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Size: {size[0]}px</Label>
                <Slider
                  value={size}
                  onValueChange={setSize}
                  min={128}
                  max={512}
                  step={32}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Foreground</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-10 h-9 md:h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Background</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-9 md:h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Error Correction</Label>
                <Select
                  value={errorLevel}
                  onValueChange={(v) => setErrorLevel(v as typeof errorLevel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <Card className="h-fit lg:sticky lg:top-4">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg">QR Code Preview</CardTitle>
            <CardDescription className="text-xs md:text-sm">Your generated QR code</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-3 md:space-y-4">
            <canvas ref={canvasRef} className="hidden" />

            {qrDataUrl ? (
              <div className="p-2 md:p-4 bg-white rounded-lg shadow-sm">
                <img src={qrDataUrl} alt="QR Code" className="max-w-[200px] md:max-w-full" />
              </div>
            ) : (
              <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-dashed rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground p-4">
                  <QrCode className="h-10 w-10 md:h-16 md:w-16 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Enter content to generate QR code</p>
                </div>
              </div>
            )}

            <div className="flex gap-1 md:gap-2 flex-wrap justify-center w-full">
              <Button onClick={handleDownloadPNG} disabled={!qrDataUrl} size="sm" className="text-xs md:text-sm">
                <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">PNG</span>
              </Button>
              <Button
                onClick={handleDownloadSVG}
                variant="outline"
                disabled={!qrDataUrl}
                size="sm"
                className="text-xs md:text-sm"
              >
                <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">SVG</span>
              </Button>
              <Button
                onClick={handleCopyToClipboard}
                variant="outline"
                disabled={!qrDataUrl}
                size="sm"
                className="text-xs md:text-sm"
              >
                <Copy className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm" className="text-xs md:text-sm">
                <RotateCcw className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRGenerator;
