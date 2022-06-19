#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use cocoa::appkit::{NSWindow, NSWindowStyleMask, NSWindowTitleVisibility};
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
fn greet(name: &str) -> String {
  format!("Hello, {}!", name)
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
    .invoke_handler(tauri::generate_handler![greet])
    .setup(|app| {
      let win = app.get_window("main").unwrap();
      win.set_transparent_titlebar(true, false);

      Ok(())
    })
    .run(context)
    .expect("error while running tauri application");
}
