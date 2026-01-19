import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IDEProvider, useIDE } from '@/contexts/IDEContext';
import BlocklyEditor from '@/components/BlocklyEditor';
import CodePanel from '@/components/CodePanel';
import ConsolePanel from '@/components/ConsolePanel';
import SerialMonitor from '@/components/SerialMonitor';
import Toolbar from '@/components/Toolbar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Code, Terminal, Radio, Home, Settings, LogOut, Cloud } from 'lucide-react';
import * as Blockly from 'blockly';
import { useAuth } from '@/hooks/useAuth';
import { 
  syncProjectToCloud, 
  getAllCloudProjects, 
  type CloudProject 
} from '@/lib/cloud-storage';
import { toast } from 'sonner';

const IDEContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    saveProject,
    generatedCode,
    currentProject,
    openProject,
    createNewProject,
    addConsoleMessage,
    selectedBoard
  } = useIDE();
  
  const { isAuthenticated, signOut, user } = useAuth();
  const [cloudProjectId, setCloudProjectId] = useState<string | undefined>();

  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  
  // Get workspace reference for saving
  useEffect(() => {
    const checkWorkspace = () => {
      const container = document.querySelector('.blockly-container');
      if (container) {
        const workspace = Blockly.getMainWorkspace() as Blockly.WorkspaceSvg;
        if (workspace) {
          workspaceRef.current = workspace;
        }
      }
    };
    
    const timer = setTimeout(checkWorkspace, 500);
    return () => clearTimeout(timer);
  }, []);

  const getWorkspaceXml = useCallback((): string => {
    if (workspaceRef.current) {
      const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
      return Blockly.Xml.domToText(xml);
    }
    return '';
  }, []);

  const handleSave = useCallback(async () => {
    const xml = getWorkspaceXml();
    if (xml) {
      await saveProject(xml, generatedCode);
    }
  }, [getWorkspaceXml, saveProject, generatedCode]);

  const handleNewProject = useCallback(async (name: string) => {
    const xml = getWorkspaceXml() || '';
    await createNewProject(name, xml, generatedCode);
  }, [getWorkspaceXml, createNewProject, generatedCode]);

  const handleOpenProject = useCallback(async (id: string) => {
    await openProject(id);
    addConsoleMessage('info', 'Project loaded successfully');
  }, [openProject, addConsoleMessage]);

  // Cloud sync functions
  const handleSyncToCloud = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to sync to cloud');
      return;
    }

    const xml = getWorkspaceXml();
    const project = await syncProjectToCloud(
      {
        name: currentProject?.name || 'Untitled Project',
        blocklyXml: xml,
        generatedCode,
        board: selectedBoard.fqbn,
      },
      cloudProjectId
    );

    if (project) {
      setCloudProjectId(project.id);
      addConsoleMessage('success', 'Project synced to cloud!');
    } else {
      addConsoleMessage('error', 'Failed to sync project');
    }
  }, [isAuthenticated, currentProject, generatedCode, selectedBoard, cloudProjectId, getWorkspaceXml, addConsoleMessage]);

  const handleLoadFromCloud = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to load from cloud');
      return;
    }

    const cloudProjects = await getAllCloudProjects();
    if (cloudProjects.length === 0) {
      toast.info('No cloud projects found');
      return;
    }

    // Load the most recent cloud project
    const latestProject = cloudProjects[0];
    setCloudProjectId(latestProject.id);
    
    await createNewProject(
      latestProject.name,
      latestProject.blockly_xml,
      latestProject.generated_code
    );
    
    addConsoleMessage('success', `Loaded cloud project: ${latestProject.name}`);
  }, [isAuthenticated, createNewProject, addConsoleMessage]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentProject) {
        handleSave();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [currentProject, handleSave]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background p-4 box-border overflow-hidden font-sans">
        
        {/* --- SIDEBAR FLOTANTE (Claymorphism) --- */}
        <Sidebar className="border-none bg-transparent shadow-none z-50" collapsible="icon">
          <SidebarContent className="bg-card rounded-3xl shadow-clay-card border-none mx-2 my-2 transition-all duration-300">
            <SidebarHeader className="p-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-black shadow-glow-sm">
                  A
                </div>
                <span className="font-black text-primary text-xl tracking-tight group-data-[collapsible=icon]:hidden">
                  ArduIDE
                </span>
              </div>
            </SidebarHeader>

            <SidebarMenu className="px-4 py-4 gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton className="h-12 rounded-xl hover:bg-primary/10 hover:text-primary transition-all font-bold text-muted-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary">
                  <Home className="w-5 h-5" />
                  <span className="text-base">Inicio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-12 rounded-xl hover:bg-primary/10 hover:text-primary transition-all font-bold text-muted-foreground">
                  <Cloud className="w-5 h-5" />
                  <span className="text-base">Mis Proyectos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-12 rounded-xl hover:bg-primary/10 hover:text-primary transition-all font-bold text-muted-foreground">
                  <Settings className="w-5 h-5" />
                  <span className="text-base">Ajustes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarFooter className="p-4 mt-auto">
              {isAuthenticated ? (
                <div className="bg-secondary/20 p-3 rounded-2xl flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                    <p className="text-xs font-bold truncate text-secondary-foreground">{user?.email}</p>
                    <button onClick={() => signOut()} className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 mt-1 font-bold">
                      <LogOut className="w-3 h-3" /> Salir
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2 text-center text-xs text-muted-foreground font-medium group-data-[collapsible=icon]:hidden">
                  No conectado
                </div>
              )}
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <main className="flex-1 flex flex-col min-w-0 gap-4 h-full relative z-10 pl-2">
          
          {/* TOOLBAR TIPO ISLA */}
          <div className="w-full relative z-20">
            <Toolbar 
              onSave={handleSave}
              onNewProject={handleNewProject}
              onOpenProject={handleOpenProject}
              onSyncToCloud={handleSyncToCloud}
              onLoadFromCloud={handleLoadFromCloud}
            />
          </div>

          {/* ÁREA DE TRABAJO HUNDIDA (Neumorphism Pressed) */}
          <div className="flex-1 rounded-3xl border-4 border-white/50 bg-white/40 shadow-neu-pressed overflow-hidden relative backdrop-blur-sm">
            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
              
              {/* --- PANEL IZQUIERDO: BLOCKLY --- */}
              <ResizablePanel defaultSize={60} minSize={30} className="p-3">
                <div className="h-full w-full rounded-2xl overflow-hidden bg-white shadow-inner border border-white/50 relative group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary z-10 opacity-50"></div>
                  <BlocklyEditor 
                    initialXml={currentProject?.blocklyXml}
                  />
                  {/* Etiqueta flotante */}
                  <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm pointer-events-none">
                    Editor de Bloques
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-transparent w-4 hover:bg-primary/20 transition-colors" />

              {/* --- PANEL DERECHO: CÓDIGO & CONSOLA --- */}
              <ResizablePanel defaultSize={40} minSize={25} className="p-3 pl-0">
                <div className="h-full w-full flex flex-col rounded-2xl overflow-hidden bg-card shadow-clay-card border border-white/60">
                  
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
                    {/* Header de Pestañas estilo Carpeta */}
                    <div className="px-2 pt-2 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
                      <TabsList className="bg-transparent h-12 p-0 w-full justify-start gap-2">
                        <TabsTrigger 
                          value="code" 
                          className="rounded-t-xl rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 h-12 gap-2 text-muted-foreground data-[state=active]:text-primary font-bold transition-all"
                        >
                          <Code className="w-4 h-4" />
                          Código C++
                        </TabsTrigger>
                        <TabsTrigger 
                          value="console"
                          className="rounded-t-xl rounded-b-none border-b-2 border-transparent data-[state=active]:border-warning data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 h-12 gap-2 text-muted-foreground data-[state=active]:text-warning-foreground font-bold transition-all"
                        >
                          <Terminal className="w-4 h-4" />
                          Consola
                          {/* Badge de notificación simulado */}
                          <span className="w-2 h-2 rounded-full bg-warning ml-1"></span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="serial"
                          className="rounded-t-xl rounded-b-none border-b-2 border-transparent data-[state=active]:border-success data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 h-12 gap-2 text-muted-foreground data-[state=active]:text-success font-bold transition-all"
                        >
                          <Radio className="w-4 h-4" />
                          Monitor Serie
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Contenido de Pestañas */}
                    <div className="flex-1 bg-white p-0 overflow-hidden relative">
                      {activeTab === 'code' && (
                        <div className="h-full w-full animate-in fade-in duration-300">
                           <CodePanel />
                        </div>
                      )}
                      {activeTab === 'console' && (
                        <div className="h-full w-full p-2 bg-[#1e1e1e] animate-in fade-in duration-300">
                           <ConsolePanel />
                        </div>
                      )}
                      {activeTab === 'serial' && (
                        <div className="h-full w-full animate-in fade-in duration-300">
                           <SerialMonitor />
                        </div>
                      )}
                    </div>
                  </Tabs>

                </div>
              </ResizablePanel>

            </ResizablePanelGroup>
          </div>

          {/* STATUS BAR FLOTANTE */}
          <div className="h-8 bg-white/60 backdrop-blur rounded-full px-6 flex items-center justify-between text-xs font-bold text-muted-foreground shadow-sm mx-2 mb-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Arduino Web IDE v1.0
              </span>
              {currentProject && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                  Proyecto: {currentProject.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                Auto-guardado: ACTIVO
              </span>
            </div>
          </div>

        </main>
      </div>
    </SidebarProvider>
  );
};

const Index: React.FC = () => {
  return (
    <IDEProvider>
      <IDEContent />
    </IDEProvider>
  );
};

export default Index;