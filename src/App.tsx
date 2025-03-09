import * as React from 'react';
import { Container, Typography } from "@mui/material";
import { createTheme } from '@mui/material/styles';
import { Session, Navigation } from '@toolpad/core/AppProvider';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Route, Routes } from "react-router-dom";
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import WalletContext, { IContextProps, UserNameAvatar } from './contexts/walletContext';
import qort from "./assets/qort.png";
import btc from "./assets/btc.png";
import ltc from "./assets/ltc.png";
import doge from "./assets/doge.png";
import dgb from "./assets/dgb.png";
import rvn from "./assets/rvn.png";
import arrr from "./assets/arrr.png";
import qwallets from "./assets/qw-logo.png";
import noAvatar from "./assets/noavatar.png";
import WelcomePage from "./pages/welcome/welcome";
import QortalWallet from "./pages/qort/index";
import LitecoinWallet from "./pages/ltc/index";
import BitcoinWallet from "./pages/btc/index";
import DogecoinWallet from "./pages/doge/index";
import DigibyteWallet from "./pages/dgb/index";
import RavencoinWallet from "./pages/rvn/index";
import PirateWallet from "./pages/arrr/index";

const walletTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  palette: {
    primary: {
      light: '#757ce8',
      main: '#03a9f4',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#03a9f4',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200
    },
  },
});

function App() {
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [selectedCoin, setSelectedCoin] = React.useState("QORTAL");
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isUsingGateway, setIsUsingGateway] = React.useState(true);
  const [userNameAvatar, setUserNameAvatar] = React.useState<Record<string, UserNameAvatar>>({});
  const [avatar, setAvatar] = React.useState<string>("");
  const [session, setSession] = React.useState<Session | null>(null);

  const getIsUsingGateway = async () => {
    try {
      const res = await qortalRequest({
        action: "IS_USING_PUBLIC_NODE"
      });
      setIsUsingGateway(res);
    } catch (error) {
    }
  }

  React.useEffect(() => {
    getIsUsingGateway();
  }, []);

  let userSess = {};

  async function getNameInfo(address: string) {
    const response = await qortalRequest({
      action: "GET_ACCOUNT_NAMES",
      address: address,
    });
    const nameData = response;
    if (nameData?.length > 0) {
      return nameData[0].name;
    } else {
      return "No Registered Name";
    }
  };

  const askForAccountInformation = React.useCallback(async () => {
    try {
      const account = await qortalRequest({
        action: "GET_USER_ACCOUNT",
      });
      console.log("ACCOUNT", account);
      const name = await getNameInfo(account.address);
      setUserInfo({ ...account, name });
      let sessAvatar = ''
      if (name === "No Registered Name") {
        setAvatar(noAvatar);
        sessAvatar = noAvatar;
      } else {
        setAvatar(`/arbitrary/THUMBNAIL/${name}/qortal_avatar?async=true`);
        sessAvatar = `/arbitrary/THUMBNAIL/${name}/qortal_avatar?async=true`;
      }
      userSess = {
        user: {
          name: name,
          email: account?.address,
          image: sessAvatar,
        },
      };
    } catch (error) {
      console.error(error);
    }
  }, []);

  const authentication = React.useMemo(() => {
    return {
      signIn: async () => {
        await askForAccountInformation();
        setSession(userSess);
        setIsAuthenticated(true);
      },
      signOut: () => {
        setSession(null);
        setIsAuthenticated(false);
        setUserInfo(null);
        setAvatar("");
      },
    };
  }, []);

  const getCoinLabel = React.useCallback((coin?: string) => {
    switch (coin || selectedCoin) {
      case "QORTAL": {
        return 'QORT'
      }
      case "LITECOIN": {
        return 'LTC'
      }
      case "DOGECOIN": {
        return 'DOGE'
      }
      case "BITCOIN": {
        return 'BTC'
      }
      case "DIGIBYTE": {
        return 'DGB'
      }
      case "RAVENCOIN": {
        return 'RVN'
      }
      case "PIRATECHAIN": {
        return 'ARRR'
      }
      default:
        return null
    }
  }, [selectedCoin])

  const walletContextValue: IContextProps = {
    userInfo,
    setUserInfo,
    userNameAvatar,
    setUserNameAvatar,
    isAuthenticated,
    setIsAuthenticated,
    isUsingGateway,
    selectedCoin,
    setSelectedCoin,
    getCoinLabel
  };

  let Pirate = {};

  if (!isUsingGateway)
    Pirate = {
      segment: 'piratechain',
      title: 'Pirate Chain',
      icon: <img src={arrr} style={{ width: "24px", height: "auto", }} />,
    }

  const NAVIGATION: Navigation = [
    {
      kind: 'header',
      title: 'WALLETS',
    },
    {
      segment: 'qortal',
      title: 'Qortal',
      icon: <img src={qort} style={{ width: "24px", height: "auto", }} />,
    },
    {
      segment: 'litecoin',
      title: 'Litecoin',
      icon: <img src={ltc} style={{ width: "24px", height: "auto", }} />,
    },
    {
      segment: 'bitcoin',
      title: 'Bitcoin',
      icon: <img src={btc} style={{ width: "24px", height: "auto", }} />,
    },
    {
      segment: 'dogecoin',
      title: 'Dogecoin',
      icon: <img src={doge} style={{ width: "24px", height: "auto", }} />,
    },
    {
      segment: 'digibyte',
      title: 'Digibyte',
      icon: <img src={dgb} style={{ width: "24px", height: "auto", }} />,
    },
    {
      segment: 'ravencoin',
      title: 'Ravencoin',
      icon: <img src={rvn} style={{ width: "24px", height: "auto", }} />,
    },
    Pirate,
  ];
  
  return (
    <ReactRouterAppProvider
      session={session}
      authentication={authentication}
      navigation={NAVIGATION}
      branding={{
        logo: <img src={qwallets} alt="MWA Logo" />,
        title: (<Typography>
          <span style={{ color: '#60d0fd', fontSize: "24px", fontWeight: 700 }}>QORTAL </span>
          <span style={{ color: '#05a2e4', fontSize: "24px", fontWeight: 700 }}>WALLETS </span>
          <span style={{ color: '#02648d', fontSize: "24px", fontWeight: 700 }}>APP</span>
        </Typography>)
      }}
      theme={walletTheme}
    >
      <WalletContext.Provider value={walletContextValue}>
        <DashboardLayout defaultSidebarCollapsed>
          <Container sx={{ maxWidth: '100%' }} maxWidth={false}>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/qortal" element={<QortalWallet />} />
              <Route path="/litecoin" element={<LitecoinWallet />} />
              <Route path="/bitcoin" element={<BitcoinWallet />} />
              <Route path="/dogecoin" element={<DogecoinWallet />} />
              <Route path="/digibyte" element={<DigibyteWallet />} />
              <Route path="/ravencoin" element={<RavencoinWallet />} />
              <Route path="/piratechain" element={<PirateWallet />} />
            </Routes>
          </Container>
        </DashboardLayout>
      </WalletContext.Provider>
    </ReactRouterAppProvider>
  );
}

export default App;