#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use cocoa::appkit::{NSWindow, NSWindowStyleMask, NSWindowTitleVisibility};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::Manager;
use tauri::MenuEntry;
use tauri::Runtime;
use tauri::Window;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

pub trait WindowExt {
  #[cfg(target_os = "macos")]
  fn set_transparent_titlebar(&self, title_transparent: bool, remove_toolbar: bool);
}

impl<R: Runtime> WindowExt for Window<R> {
  #[cfg(target_os = "macos")]
  fn set_transparent_titlebar(&self, title_transparent: bool, remove_tool_bar: bool) {
    unsafe {
      let id = self.ns_window().unwrap() as cocoa::base::id;
      NSWindow::setTitlebarAppearsTransparent_(id, cocoa::base::YES);
      let mut style_mask = id.styleMask();
      style_mask.set(
        NSWindowStyleMask::NSFullSizeContentViewWindowMask,
        title_transparent,
      );

      if remove_tool_bar {
        style_mask.remove(
          NSWindowStyleMask::NSClosableWindowMask
            | NSWindowStyleMask::NSMiniaturizableWindowMask
            | NSWindowStyleMask::NSResizableWindowMask,
        );
      }

      id.setStyleMask_(style_mask);

      id.setTitleVisibility_(if title_transparent {
        NSWindowTitleVisibility::NSWindowTitleHidden
      } else {
        NSWindowTitleVisibility::NSWindowTitleVisible
      });

      id.setTitlebarAppearsTransparent_(if title_transparent {
        cocoa::base::YES
      } else {
        cocoa::base::NO
      });
    }
  }
}

#[tauri::command]
fn get_connections() -> Vec<AppConnection> {
  let state = load_app_state_from_file();

  state.connections
}

#[derive(Debug, Serialize, Deserialize)]
enum ConnectionEnvironment {
  Local,
  Dev,
  Staging,
  Production,
}

#[derive(Debug, Serialize, Deserialize)]
struct AppConnection {
  pub name: String,
  pub url: String,
  pub environment: ConnectionEnvironment,
}

#[derive(Debug, Serialize, Deserialize)]
struct AppState {
  pub connections: Vec<AppConnection>,
}

fn save_app_state_to_file(state: &AppState) {
  let path = Path::new("app_state.json");
  let mut file = std::fs::File::create(path).unwrap();
  serde_json::to_writer_pretty(&mut file, state).unwrap();
}

fn load_app_state_from_file() -> AppState {
  create_app_state_if_missing();
  let path = Path::new("app_state.json");
  let mut file = std::fs::File::open(path).unwrap();
  let state: AppState = serde_json::from_reader(&mut file).unwrap();
  state
}

fn create_app_state_if_missing() {
  let path = Path::new("app_state.json");
  if !path.exists() {
    let state = AppState {
      connections: vec![],
    };
    save_app_state_to_file(&state);
  }
}

fn main() {
  let context = tauri::generate_context!();
  tauri::Builder::default()
    .menu(Menu::with_items([MenuEntry::Submenu(Submenu::new(
      "File",
      Menu::with_items([
        MenuItem::Quit.into(),
        MenuItem::CloseWindow.into(),
        CustomMenuItem::new("hello", "Hello").into(),
      ]),
    ))]))
    .invoke_handler(tauri::generate_handler![get_connections])
    .setup(|app| {
      let win = app.get_window("main").unwrap();
      win.set_transparent_titlebar(true, false);

      #[cfg(debug_assertions)] // only include this code on debug builds
      {
        let window = app.get_window("main").unwrap();
        window.open_devtools();
        window.close_devtools();
      }
      Ok(())
    })
    .run(context)
    .expect("error while running tauri application");
}
