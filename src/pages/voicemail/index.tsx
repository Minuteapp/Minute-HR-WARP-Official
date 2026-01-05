import { useState } from "react";
import { Button } from "@/components/ui/button";
import VoicemailMessages from "@/components/voicemail/VoicemailMessages";
import VoicemailPersonal from "@/components/voicemail/VoicemailPersonal";
import NewVoicemailDialog from "@/components/voicemail/NewVoicemailDialog";
import VoicemailHelp from "@/components/voicemail/VoicemailHelp";

const VoicemailPage = () => {
  const [activeTab, setActiveTab] = useState<string>("ansagen");
  const [newVoicemailOpen, setNewVoicemailOpen] = useState(false);

  return (
    <div className="w-full p-6">
      <div className="flex justify-center mb-12">
        <img 
          src="/lovable-uploads/5ca249e1-0bf8-40cf-b15b-186d3bdcc3e0.png" 
          alt="Hiprocall Logo" 
          className="h-32"
        />
      </div>

      <div>
        <h1 className="text-2xl font-semibold mb-2">Business Voicemail</h1>
        <p className="text-gray-600 mb-8">Verwalten Sie Ihre Voicemail-Ansagen</p>

        <nav className="flex space-x-6 border-b border-gray-200 mb-8">
          <button 
            className={`px-4 py-3 ${
              activeTab === "ansagen" 
                ? "text-[#FF6B00] border-b-2 border-[#FF6B00] -mb-[2px] font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("ansagen")}
          >
            Meine Ansagen
          </button>
          <button 
            className={`px-4 py-3 ${
              activeTab === "daten" 
                ? "text-[#FF6B00] border-b-2 border-[#FF6B00] -mb-[2px] font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("daten")}
          >
            Meine Daten
          </button>
          <button className="px-4 py-3 text-gray-600 hover:text-gray-900">
            Konfiguration
          </button>
          <button className="px-4 py-3 text-gray-600 hover:text-gray-900">
            Hilfe
          </button>
          <button className="px-4 py-3 text-gray-600 hover:text-gray-900">
            Admin
          </button>
        </nav>

        {activeTab === "ansagen" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Meine Ansagen</h2>
              <Button 
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
                onClick={() => setNewVoicemailOpen(true)}
              >
                + Neue Ansage
              </Button>
            </div>
            <VoicemailMessages />
          </>
        )}

        {activeTab === "daten" && <VoicemailPersonal />}

        {activeTab === "hilfe" && <VoicemailHelp />}

        <NewVoicemailDialog 
          open={newVoicemailOpen}
          onOpenChange={setNewVoicemailOpen}
        />
      </div>
    </div>
  );
};

export default VoicemailPage;
