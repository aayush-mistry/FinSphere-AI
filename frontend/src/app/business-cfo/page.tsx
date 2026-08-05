import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Trophy, Lightbulb, Mail, Globe, User } from "lucide-react";

export default function BusinessCFOPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Business CFO</h2>
      </div>
      
      {/* CEO Information Section */}
      <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
        {/* Banner */}
        <div className="w-full h-28 bg-gradient-to-r from-indigo-100 via-sky-50 to-emerald-100"></div>
        
        <CardContent className="relative pt-0 pb-8">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left Column: Avatar & Basic Info */}
            <div className="flex flex-col items-center md:items-start space-y-4 md:w-1/3 -mt-12">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center shrink-0 text-slate-400 relative z-10">
                <User className="w-10 h-10" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-slate-900">Sarah Jenkins</h3>
                <p className="text-indigo-600 font-medium flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                  Chief Executive Officer
                </p>
                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="outline" className="bg-slate-50 text-slate-600">
                    <Briefcase className="w-3 h-3 mr-1" /> 15+ Years Exp.
                  </Badge>
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <a href="#" className="p-2 bg-slate-50 text-slate-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
                <a href="#" className="p-2 bg-slate-50 text-slate-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            {/* Right Column: Bio, Vision, Achievements */}
            <div className="flex-1 space-y-6 mt-4 md:mt-0 md:pt-2">
              
              {/* Bio */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  Professional Bio
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Visionary leader with a proven track record of scaling high-growth fintech startups. 
                  Specializes in blending AI technology with deep financial analytics to democratize 
                  wealth management and enterprise CFO services for businesses globally.
                </p>
              </div>

              {/* Vision */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Leadership Vision
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-lg border-l-4 border-amber-400">
                  &quot;To build a truly autonomous financial ecosystem where businesses and individuals 
                  never have to second-guess their financial health, empowering them to focus purely 
                  on growth and innovation.&quot;
                </p>
              </div>

              {/* Achievements */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-500" /> Key Achievements
                </h4>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    Spearheaded the successful Series B funding round, raising $45M.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    Grew the FinSphere AI user base by 400% over the last 18 months.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                    Listed in Forbes 40 Under 40 in Finance and Technology.
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for the rest of the CFO page */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[300px]">
        <div className="text-slate-500 text-center py-20 flex flex-col items-center justify-center">
          <p>Business CFO interface features (Revenue, Expenses, Payroll, etc.) will appear here.</p>
        </div>
      </div>
    </div>
  );
}
